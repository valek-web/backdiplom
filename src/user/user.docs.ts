import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

export function DocsGetUserById() {
  const apiResponseOk = {
    id: 1,
    email: 'user@example.com',
    name: 'Иван Петров',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
  };
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить пользователя по ID',
      description: 'Возвращает данные пользователя по его идентификатору',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID пользователя',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Пользователь найден',
      schema: {
        example: apiResponseOk,
      },
    }),
  );
}

export function DocsGetAllUser() {
  const apiResponseOk = [
    {
      id: 1,
      email: 'user@example.com',
      name: 'Иван Петров',
      createdAt: '2024-01-01T12:00:00Z',
      updatedAt: '2024-01-01T12:00:00Z',
    },
    {
      id: 1,
      email: 'user@example.com',
      name: 'Иван Петров',
      createdAt: '2024-01-01T12:00:00Z',
      updatedAt: '2024-01-01T12:00:00Z',
    },
  ];
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить пользователей',
      description: 'Возвращает данные пользователей',
    }),
    ApiOkResponse({
      description: 'Пользователь найден',
      schema: {
        example: apiResponseOk,
      },
    }),
  );
}

export function DocsUpdateUser() {
  const exampleRequest = {
    name: 'Иван Петров (обновлено)',
  };

  const exampleResponse = {
    id: 1,
    email: 'updated@example.com',
    name: 'Иван Петров (обновлено)',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-03T14:30:00Z',
  };

  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить пользователя',
      description: 'Обновляет данные пользователя по ID',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID пользователя',
      example: 1,
    }),
    ApiBody({
      description: 'Данные для обновления пользователя',
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'Иван Петров (обновлено)',
            description: 'Имя пользователя',
          },
        },
        example: exampleRequest,
      },
    }),
    ApiOkResponse({
      description: 'Пользователь успешно обновлен',
      schema: {
        example: exampleResponse,
      },
    }),
  );
}
