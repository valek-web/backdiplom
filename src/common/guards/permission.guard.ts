import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from 'src/generated/prisma/enums';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Получаем требуемое право из декоратора
    const requiredPermission = this.reflector.get<Permission>(
      'permission',
      context.getHandler(),
    );

    // Если право не требуется - пропускаем
    if (!requiredPermission) {
      return true;
    }

    // Получаем пользователя из request (уже добавлен в AuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    // Админ имеет доступ ко всему
    if (user.isSystemAdmin) {
      return true;
    }

    // Проверяем наличие права у пользователя (из токена)
    const hasPermission = user.permissions?.includes(requiredPermission);

    if (!hasPermission) {
      throw new ForbiddenException(
        `Нет доступа. Требуется право: ${requiredPermission}`,
      );
    }

    return true;
  }
}
