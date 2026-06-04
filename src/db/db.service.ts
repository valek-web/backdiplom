import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from './../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class DbService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Читаем DATABASE_URL ВНУТРИ конструктора
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    console.log(
      'connectionString:',
      connectionString.replace(/:[^:@]*@/, ':****@'),
    );

    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
      await this.$disconnect();
    });
  }
}
