import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { Permission } from 'src/generated/prisma/enums';

@Injectable()
export class AllowedEmailsService {
  private readonly logger = new Logger(AllowedEmailsService.name);

  constructor(private db: DbService) {}

  async addAllowedEmail(email: string) {
    try {
      // Проверка, не добавлен ли уже email
      const existing = await this.db.allowedEmail.findUnique({
        where: { email },
      });

      if (existing) {
        throw new ConflictException(
          'Этот email уже добавлен в список разрешенных',
        );
      }

      // Добавление email
      return this.db.allowedEmail.create({
        data: {
          email: email.toLowerCase(),
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        this.logger.error(`Этот email уже добавлен в список разрешенных`);
      }
      throw new InternalServerErrorException(
        `Не удалось добавить email в список разрешенных`,
      );
    }
  }

  async removeAllowedEmail(id: number) {
    const allowedEmail = await this.db.allowedEmail.findUnique({
      where: { id: id },
    });

    if (!allowedEmail) {
      throw new NotFoundException('Email не найден в списке разрешенных');
    }

    try {
      return this.db.$transaction(async (prisma) => {
        const isSystemAdmin = await prisma.user.findUnique({
          where: { id: id },
        });

        if (isSystemAdmin?.isSystemAdmin) {
          throw new ConflictException(
            'Невозможно удалить админа из списка разрешенных',
          );
        }

        const allowedEmailDelete = await prisma.allowedEmail.delete({
          where: { id: allowedEmail.id },
        });

        const user = await this.db.user.findUnique({
          where: { email: allowedEmail.email },
        });

        if (user) {
          await this.db.user.delete({
            where: { email: allowedEmail.email },
          });
        }

        return allowedEmailDelete;
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Не удалось удалить email из списка разрешенных`,
      );
    }
  }

  async getAllowedEmails() {
    try {
      return this.db.allowedEmail.findMany({ include: { user: true } });
    } catch (e) {
      throw new InternalServerErrorException(
        `Не удалось получить список разрешенных email`,
      );
    }
  }

  async isEmailAllowed(email: string): Promise<boolean> {
    const allowedEmail = await this.db.allowedEmail.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    });

    return !!allowedEmail;
  }

  async updateUserPermissions(userId: number, permissions: Permission[]) {
    return this.db.user.update({
      where: { id: userId },
      data: { permissions: permissions },
    });
  }
}
