import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DbService } from 'src/db/db.service';
import { SingTokenType } from '../types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private db: DbService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Токен авторизации не найден');
    }

    try {
      const payload: SingTokenType = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET, // Проверяем как access токен
      });

      if (payload.type !== 'access') {
        throw new UnauthorizedException('Требуется access токен');
      }

      const user = await this.db.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Недействительный refresh токен');
      }
      console.log(user);
      console.log(payload);

      if (user?.version !== payload.version) {
        throw new UnauthorizedException(
          'Токен отозван. Требуется повторная авторизация',
        );
      }

      // 4. Прикрепляем информацию о пользователе к запросу
      request['user'] = { ...payload, permissions: user.permissions };
    } catch (error) {
      // 5. Более информативные ошибки
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Срок действия токена истек');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Недействительный токен');
      }
      throw new UnauthorizedException('Ошибка аутентификации');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
