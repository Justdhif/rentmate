import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ConfigService } from '@nestjs/config';
import * as schema from './schema';
import { DRIZZLE, DrizzleDB } from './database.constants';

export * from './database.constants';

export const databaseProviders = [
  {
    provide: DRIZZLE,
    inject: [ConfigService],
    useFactory: (configService: ConfigService): DrizzleDB => {
      const connectionString = configService.get<string>('DATABASE_URL')!;
      const poolMax = Number(configService.get<string>('DATABASE_POOL_MAX') || 20);
      const isDev = configService.get<string>('NODE_ENV') !== 'production';

      const client = postgres(connectionString, {
        ssl: isDev ? undefined : 'require',
        max: poolMax,
      });
      return drizzle(client, { schema });
    },
  },
];
