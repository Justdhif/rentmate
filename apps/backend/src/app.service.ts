import { Injectable, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE } from './database/database.constants';
import type { DrizzleDB } from './database/database.constants';

@Injectable()
export class AppService {
  constructor(
    @Inject(DRIZZLE)
    private db: DrizzleDB,
  ) {}

  getHello(): string {
    return 'RentMate API is operational 🚀';
  }

  async getHealth() {
    const startTime = Date.now();
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;

    try {
      await this.db.execute(sql`SELECT 1`);
      dbLatencyMs = Date.now() - startTime;
    } catch {
      dbStatus = 'unhealthy';
    }

    const memoryUsage = process.memoryUsage();

    return {
      status: dbStatus === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      memory: {
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
