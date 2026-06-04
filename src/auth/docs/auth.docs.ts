// modules/auth/auth.docs.ts
import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  StartRegistryDto,
  EndRegistryDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dto/auth.dto';

// POST /auth/register
export function DocsRegisterStart() {
  return applyDecorators(
    ApiOperation({
      summary: 'Начать регистрацию',
      description: 'Отправляет код подтверждения на email',
    }),
    ApiBody({
      description: 'Данные для регистрации',
      type: StartRegistryDto,
    }),
    ApiCreatedResponse({
      description: 'Код отправлен',
      schema: {
        example: {
          message: 'Код отправлен на почту',
          code: 12345,
        },
      },
    }),
  );
}

// POST /auth/register-send-code
export function DocsRegisterEnd() {
  return applyDecorators(
    ApiOperation({
      summary: 'Завершить регистрацию',
      description: 'Подтверждает код и создает пользователя',
    }),
    ApiBody({
      description: 'Код подтверждения',
      type: EndRegistryDto,
    }),
    ApiCreatedResponse({
      description: 'Регистрация завершена',
      schema: {
        example: {
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'Иван Петров',
          },
          message: 'Регистрация успешно завершена.',
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
  );
}

// POST /auth/login
export function DocsLogin() {
  return applyDecorators(
    ApiOperation({
      summary: 'Вход в систему',
      description: 'Авторизует пользователя и возвращает токены',
    }),
    ApiBody({
      description: 'Данные для входа',
      type: LoginDto,
    }),
    ApiOkResponse({
      description: 'Успешный вход',
      schema: {
        example: {
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'Иван Петров',
            permissions: [
              'ACCESS_TASKS',
              'READ_SALES',
              'WRITE_SALES',
              'READ_POST',
              'WRITE_POST',
              'ACCESS_ADMIN',
            ],
          },
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
  );
}

// POST /auth/logout
export function DocsLogout() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Выход из системы',
      description: 'Завершает сессию пользователя',
    }),
    ApiOkResponse({
      description: 'Успешный выход',
      schema: {
        example: {
          message: 'Успешный выход из системы',
        },
      },
    }),
  );
}

// POST /auth/refresh
export function DocsRefreshTokens() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить токены',
      description: 'Обновляет access и refresh токены',
    }),
    ApiOkResponse({
      description: 'Токены обновлены',
      schema: {
        example: {
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'Иван Петров',
          },
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
  );
}

// POST /auth/validate
export function DocsValidateToken() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Проверить токен',
      description: 'Проверяет валидность access токена',
    }),
    ApiOkResponse({
      description: 'Токен валиден',
      schema: {
        example: {
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'Иван Петров',
          },
        },
      },
    }),
  );
}

// POST /auth/forgot-password
export function DocsForgotPassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Запросить сброс пароля',
      description: 'Отправляет код для сброса пароля на email',
    }),
    ApiBody({
      description: 'Email для сброса пароля',
      type: ForgotPasswordDto,
    }),
    ApiOkResponse({
      description: 'Код отправлен',
      schema: {
        example: {
          message: 'На ваш email отправлен код для сброса пароля',
          code: 123456,
        },
      },
    }),
  );
}

// POST /auth/reset-password
export function DocsResetPassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Сбросить пароль',
      description: 'Устанавливает новый пароль по коду подтверждения',
    }),
    ApiBody({
      description: 'Данные для сброса пароля',
      type: ResetPasswordDto,
    }),
    ApiOkResponse({
      description: 'Пароль изменен',
      schema: {
        example: {
          message: 'Пароль успешно изменен',
        },
      },
    }),
  );
}

export function DocsUpdateUserPermissions() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить права пользователя',
      description:
        'Изменяет список permissions пользователя. Требуется право MANAGE_USERS',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID пользователя',
      example: 1,
    }),
    ApiBody({
      description: 'Новый список прав пользователя',
      schema: {
        example: {
          permissions: ['READ_POST', 'WRITE_POST'],
        },
      },
    }),
    ApiOkResponse({
      description: 'Права успешно обновлены',
      schema: {
        example: {
          id: 1,
          email: 'user@example.com',
          permissions: ['READ_POST', 'WRITE_POST'],
        },
      },
    }),
  );
}
