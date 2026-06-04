import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DbService } from 'src/db/db.service';

@Injectable()
export class SystemAdminService implements OnModuleInit {
  private readonly logger = new Logger(SystemAdminService.name);

  constructor(private db: DbService) {}

  async onModuleInit() {
    await this.initializeSystemAdmin();
  }

  // Инициализация системного админа
  private async initializeSystemAdmin() {
    const adminEmail = process.env.SYSTEM_ADMIN_EMAIL;
    const adminPassword = process.env.SYSTEM_ADMIN_PASSWORD;
    const adminName = process.env.SYSTEM_ADMIN_NAME || 'System Admin';

    if (!adminEmail || !adminPassword) {
      this.logger.warn(
        'SYSTEM_ADMIN_EMAIL или SYSTEM_ADMIN_PASSWORD не установлены в .env',
      );
      return;
    }

    try {
      // Проверяем, существует ли уже системный админ
      const existingAdmin = await this.db.user.findFirst({
        where: {
          email: adminEmail,
          isSystemAdmin: true,
        },
      });

      if (existingAdmin) {
        this.logger.log(`Системный админ уже существует: ${adminEmail}`);
        return;
      }

      // Хэшируем пароль
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Создаем системного админа
      const admin = await this.db.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          isSystemAdmin: true,
          permissions: [
            'ACCESS_ADMIN',
            'ACCESS_TASKS',
            'READ_POST',
            'WRITE_POST',
            'ACCESS_CHAT',
            'ACCESS_SALES',
          ],
        },
      });

      await this.db.allowedEmail.create({
        data: {
          email: admin.email,
          userId: admin.id,
        },
      });

      this.logger.log(`Системный админ создан: ${adminEmail}`);
    } catch (error) {
      this.logger.error(`Ошибка при создании системного админа:`, error);
    }
  }

  // Проверка, является ли пользователь системным админом
  async isSystemAdmin(userId: number): Promise<boolean> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { isSystemAdmin: true },
    });

    return user?.isSystemAdmin || false;
  }
}
