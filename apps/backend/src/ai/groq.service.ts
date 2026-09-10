import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GROQ_API_KEY') || '';
    this.model =
      this.configService.get<string>('GROQ_MODEL') ||
      'llama-3.3-70b-versatile';
  }

  async chatCompletion(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      jsonMode?: boolean;
      maxTokens?: number;
    },
  ): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('GROQ_API_KEY is not configured');
    }

    const bodyPayload: any = {
      model: this.model,
      messages,
      temperature: options?.temperature ?? 0.3,
    };

    if (options?.jsonMode) {
      bodyPayload.response_format = { type: 'json_object' };
    }

    if (options?.maxTokens) {
      bodyPayload.max_tokens = options.maxTokens;
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      this.logger.error('Groq API Error:', data);
      throw new BadRequestException(
        data.error?.message || 'Failed to get response from Groq AI',
      );
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new BadRequestException('Empty response from Groq AI');
    }

    return content;
  }
}
