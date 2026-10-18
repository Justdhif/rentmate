import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockAppService = {
      getHello: jest.fn().mockReturnValue('RentMate API is operational 🚀'),
      getHealth: jest.fn().mockResolvedValue({
        status: 'ok',
        timestamp: '2026-10-18T00:00:00.000Z',
        uptimeSeconds: 100,
        database: { status: 'healthy', latencyMs: 5 },
        memory: { rssMb: 50, heapUsedMb: 30, heapTotalMb: 40 },
        environment: 'test',
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return operational status message', () => {
      expect(appController.getHello()).toBe('RentMate API is operational 🚀');
    });
  });

  describe('health', () => {
    it('should return health status payload', async () => {
      const health = await appController.getHealth();
      expect(health.status).toBe('ok');
      expect(health.database.status).toBe('healthy');
    });
  });
});
