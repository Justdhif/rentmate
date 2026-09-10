import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { GroqService } from './groq.service';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [AnalyticsModule],
  controllers: [AiController],
  providers: [AiService, GroqService],
  exports: [AiService, GroqService],
})
export class AiModule {}
