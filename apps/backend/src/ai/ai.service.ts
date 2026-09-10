import { Injectable, Logger } from '@nestjs/common';
import { GroqService, ChatMessage } from './groq.service';
import { AnalyticsService } from '../analytics/analytics.service';

export interface MaintenanceAnalysisResult {
  category: 'Air Conditioner' | 'Plumbing' | 'Electrical' | 'Furniture' | 'General';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  summary: string;
  suggestedAction: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private groqService: GroqService,
    private analyticsService: AnalyticsService,
  ) {}

  async analyzeMaintenanceReport(
    description: string,
  ): Promise<MaintenanceAnalysisResult> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are the RentMate AI Maintenance Classifier.
Your job is to analyze tenant maintenance reports and classify them into a strict JSON structure.
Valid categories: ["Air Conditioner", "Plumbing", "Electrical", "Furniture", "General"].
Valid priorities: ["LOW", "MEDIUM", "HIGH", "URGENT"].

Return ONLY valid JSON with this exact schema:
{
  "category": "Air Conditioner",
  "priority": "HIGH",
  "summary": "Short 1-sentence summary of the problem",
  "suggestedAction": "Initial recommended inspection or troubleshooting steps"
}`,
      },
      {
        role: 'user',
        content: `Report text: "${description}"`,
      },
    ];

    try {
      const responseText = await this.groqService.chatCompletion(messages, {
        temperature: 0.1,
        jsonMode: true,
      });

      const parsed = JSON.parse(responseText);

      const validCategories = [
        'Air Conditioner',
        'Plumbing',
        'Electrical',
        'Furniture',
        'General',
      ];
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

      return {
        category: validCategories.includes(parsed.category)
          ? parsed.category
          : 'General',
        priority: validPriorities.includes(parsed.priority)
          ? parsed.priority
          : 'MEDIUM',
        summary: parsed.summary || description,
        suggestedAction:
          parsed.suggestedAction || 'Inspect the issue on site.',
      };
    } catch (error) {
      this.logger.error('Error analyzing maintenance with Groq:', error);
      return {
        category: 'General',
        priority: 'MEDIUM',
        summary: description,
        suggestedAction: 'Inspect issue directly.',
      };
    }
  }

  async chatAssistant(ownerId: string, userRole: string, message: string) {
    const [overview, revenue, occupancy, maintenance] = await Promise.all([
      this.analyticsService.getOverview(ownerId, userRole),
      this.analyticsService.getRevenueMetrics(ownerId, userRole),
      this.analyticsService.getOccupancyMetrics(ownerId, userRole),
      this.analyticsService.getMaintenanceMetrics(ownerId, userRole),
    ]);

    const contextSnapshot = {
      overview,
      revenue,
      occupancy,
      maintenance,
    };

    const systemPrompt = `Anda adalah RentMate Smart Assistant, asisten AI resmi platform manajemen kost RentMate.
Anda bertugas membantu Pemilik Kost (Owner) menganalisis data properti, pemasukan, kamar, dan perbaikan mereka secara cerdas, solutif, dan ramah.

PANDUAN KETAT:
1. Jawab pertanyaan hanya berdasarkan data operasional aktual milik owner yang disediakan di bawah ini.
2. Format angka mata uang dalam Rupiah (misal: Rp 1.500.000).
3. Jika ditanya kamar mana yang bermasalah, gunakan data pada bagian "maintenance.mostProblematicRoom".
4. Jika ditanya perbandingan pemasukan atau kamar kosong, gunakan data finansial & okupansi.
5. Gunakan bahasa Indonesia yang profesional, ramah, dan ringkas.

DATA OPERASIONAL AKTUAL OWNER:
${JSON.stringify(contextSnapshot, null, 2)}`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: message,
      },
    ];

    const reply = await this.groqService.chatCompletion(messages, {
      temperature: 0.3,
    });

    return {
      reply,
      contextSnapshot: {
        totalProperties: overview.totalProperties,
        totalRooms: overview.rooms.total,
        occupiedRooms: overview.rooms.occupied,
        occupancyRate: overview.rooms.occupancyRate,
        monthlyRevenue: overview.revenue.monthlyRevenue,
        openMaintenance: overview.maintenance.openCount,
        mostProblematicRoom: maintenance.mostProblematicRoom,
      },
    };
  }

  async getSmartInsights(ownerId: string, userRole: string) {
    const [overview, maintenance, revenue] = await Promise.all([
      this.analyticsService.getOverview(ownerId, userRole),
      this.analyticsService.getMaintenanceMetrics(ownerId, userRole),
      this.analyticsService.getRevenueMetrics(ownerId, userRole),
    ]);

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `Anda adalah RentMate Smart Insight Engine.
Tugas Anda adalah meninjau metrik operasional kost dan menghasilkan 2-4 insight bisnis/operasional proaktif yang actionable.

Kembalikan format HANYA JSON array:
{
  "insights": [
    {
      "title": "Judul Insight Singkat",
      "type": "WARNING | TIP | SUCCESS | ACTION_REQUIRED",
      "description": "Penjelasan situasi berdasarkan data",
      "recommendation": "Langkah konkrit yang direkomendasikan"
    }
  ]
}

DATA OPERASIONAL:
${JSON.stringify({ overview, maintenance, revenue }, null, 2)}`,
      },
      {
        role: 'user',
        content:
          'Hasilkan smart insights berdasarkan kondisi operasional dan finansial properti saya saat ini.',
      },
    ];

    try {
      const responseText = await this.groqService.chatCompletion(messages, {
        temperature: 0.2,
        jsonMode: true,
      });

      const parsed = JSON.parse(responseText);
      return parsed.insights || [];
    } catch (error) {
      this.logger.error('Error generating smart insights:', error);
      return [
        {
          title: 'Pemantauan Operasional',
          type: 'TIP',
          description: 'Sistem sedang mengumpulkan data operasional properti.',
          recommendation: 'Terus perbarui status kamar dan pencatatan sewa.',
        },
      ];
    }
  }
}
