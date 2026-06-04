// modules/admin/admin.docs.ts
import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AddAllowedEmailDto, RemoveAllowedEmailDto } from './../dto/auth.dto';

// POST /admin/emails
export function DocsAddAllowedEmail() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Добавить email в список разрешенных',
      description:
        'Добавляет email в список разрешенных для регистрации и отправляет приглашение',
    }),
    ApiBody({
      description: 'Email для добавления',
      type: AddAllowedEmailDto,
    }),
    ApiCreatedResponse({
      description: 'Email успешно добавлен',
      schema: {
        example: {
          id: 1,
          email: 'user@example.com',
          createdAt: new Date('2024-01-01T12:00:00Z'),
          updatedAt: new Date('2024-01-01T12:00:00Z'),
        },
      },
    }),
  );
}

// GET /admin/emails
export function DocsGetAllowedEmails() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить список разрешенных email',
      description: 'Возвращает список всех email, разрешенных для регистрации',
    }),
    ApiOkResponse({
      description: 'Список успешно получен',
      schema: {
        type: 'array',
        example: [
          {
            id: 1,
            email: 'user1@example.com',
            createdAt: new Date('2024-01-01T12:00:00Z'),
            updatedAt: new Date('2024-01-01T12:00:00Z'),
          },
          {
            id: 2,
            email: 'user2@example.com',
            createdAt: new Date('2024-01-02T12:00:00Z'),
            updatedAt: new Date('2024-01-02T12:00:00Z'),
          },
        ],
      },
    }),
  );
}

// DELETE /admin/emails/:id
export function DocsRemoveAllowedEmail() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить email из списка разрешенных',
      description:
        'Удаляет email из списка разрешенных для регистрации и удаляет связанного пользователя',
    }),
    ApiParam({
      name: 'id',
      type: RemoveAllowedEmailDto,
      description: 'ID записи в списке разрешенных',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Email успешно удален',
      schema: {
        example: {
          id: 1,
          email: 'user@example.com',
          createdAt: new Date('2024-01-01T12:00:00Z'),
          updatedAt: new Date('2024-01-01T12:00:00Z'),
        },
      },
    }),
  );
}
