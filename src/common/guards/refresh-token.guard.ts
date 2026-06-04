import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SingTokenType } from '../types';
import { DbService } from 'src/db/db.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private db: DbService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Извлекаем токен из тела запроса (для refresh обычно из body)
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new BadRequestException('Refresh токен не предоставлен');
    }

    try {
      // Проверяем refresh токен (используем JWT_REFRESH_SECRET)
      const payload: SingTokenType = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // Проверяем, что это refresh токен (не access)
      // Это опционально, но рекомендуется
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Требуется refresh токен');
      }

      const user = await this.db.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Недействительный refresh токен');
      }

      if (user?.version !== payload.version) {
        throw new UnauthorizedException(
          'Токен отозван. Требуется повторная авторизация',
        );
      }

      // Прикрепляем информацию о пользователе к запросу
      request['user'] = payload as SingTokenType;
      // Также сохраняем сам токен для возможного отзыва
      request['refreshToken'] = token;
    } catch (error) {
      // Информативные ошибки

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Срок действия refresh токена истек. Требуется повторная авторизация',
        );
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Недействительный refresh токен');
      }
      throw new UnauthorizedException('Ошибка проверки refresh токена');
    }

    return true;
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // Вариант 1: Из тела запроса (рекомендуется для refresh)
    if (request.body?.refreshToken) {
      // Может быть либо строкой, либо в формате "Bearer <token>"
      const [type, token] = request.body.refreshToken.split(' ') ?? [];
      return type === 'Bearer' ? token : request.body.refreshToken;
    }

    return undefined;
  }
}
