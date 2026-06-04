import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ConfirmationCode } from 'src/common/types';

@Injectable()
export class RedisCodesService {
  private readonly logger = new Logger(RedisCodesService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  // Сохранить код подтверждения
  async saveConfirmationData(
    email: string,
    data: Partial<ConfirmationCode>,
  ): Promise<void> {
    try {
      // Валидируем данные с помощью Zod
      const validatedData = data as ConfirmationCode;

      const key = `confirmation:${email}`;
      // Сохраняем на 10 минут (600 секунд)
      await this.redis.setex(key, 600, JSON.stringify(validatedData));
    } catch (error) {
      this.logger.error('Ошибка валидации данных', error);
      throw error;
    }
  }

  async getConfirmationData(email: string): Promise<ConfirmationCode | null> {
    try {
      const key = `confirmation:${email}`;
      const data = await this.redis.get(key);

      if (!data) return null;

      const parsedData = JSON.parse(data);
      return parsedData as ConfirmationCode;
    } catch (error) {
      throw error;
    }
  }

  async saveCode(email: string, code: string): Promise<void> {
    const key = `code:${email}`;
    await this.redis.setex(key, 600, code);
  }

  async getCode(email: string): Promise<number | null> {
    const key = `code:${email}`;
    const value = await this.redis.get(key);

    if (value === null) {
      return null;
    }

    const num = parseInt(value, 10);
    return isNaN(num) ? null : num;
  }

  async delCode(email: string): Promise<void> {
    const key = `code:${email}`;
    await this.redis.del(key);
  }

  async deleteConfirmation(email: string): Promise<void> {
    const key = `confirmation:${email}`;
    await this.redis.del(key);
  }

  async getTTLConfirmation(email: string): Promise<number> {
    const key = `confirmation:${email}`;
    return await this.redis.ttl(key);
  }
}
