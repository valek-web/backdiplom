import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { CreateClientDto, UpdateClientDto } from './client.dto';

// ========== POST /client ==========
export function DocsCreateClient() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создать нового клиента',
      description: 'Создает нового клиента в системе CRM',
    }),
    ApiBody({
      description: 'Данные для создания клиента',
      type: CreateClientDto,
      examples: {
        example1: {
          summary: 'Пример создания клиента',
          value: {
            name: 'Иван Петров',
            email: 'ivan@example.com',
            phone: '+79991234567',
            company: 'ООО Ромашка',
            position: 'Директор',
            address: 'ул. Ленина, 10',
            city: 'Москва',
            country: 'Россия',
            status: 'NEW',
            priority: 'HIGH',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Клиент успешно создан',
      schema: {
        example: {
          id: 1,
          name: 'Иван Петров',
          email: 'ivan@example.com',
          phone: '+79991234567',
          company: 'ООО Ромашка',
          position: 'Директор',
          address: 'ул. Ленина, 10',
          city: 'Москва',
          country: 'Россия',
          status: 'NEW',
          priority: 'HIGH',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Некорректные данные запроса',
      schema: {
        example: {
          statusCode: 400,
          message: [
            'Имя должно содержать минимум 2 символа',
            'Некорректный формат email',
          ],
          error: 'Bad Request',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
    ApiForbiddenResponse({
      description: 'Нет доступа к этому ресурсу',
    }),
  );
}

// ========== GET /client ==========
export function DocsFindAllClients() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить всех клиентов',
      description: 'Возвращает список всех клиентов с их продажами',
    }),
    ApiOkResponse({
      description: 'Список клиентов успешно получен',
      schema: {
        example: [
          {
            id: 1,
            name: 'Иван Петров',
            email: 'ivan@example.com',
            phone: '+79991234567',
            company: 'ООО Ромашка',
            position: 'Директор',
            address: 'ул. Ленина, 10',
            city: 'Москва',
            country: 'Россия',
            status: 'NEW',
            priority: 'HIGH',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
            sales: [],
          },
        ],
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
  );
}

// ========== PATCH /client/:id ==========
export function DocsUpdateClient() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить данные клиента',
      description: 'Обновляет информацию о клиенте. Все поля опциональны',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID клиента',
      example: 1,
      required: true,
    }),
    ApiBody({
      description: 'Данные для обновления',
      type: UpdateClientDto,
      examples: {
        example1: {
          summary: 'Обновление имени и статуса',
          value: {
            name: 'Иван Сидоров',
            status: 'ACTIVE',
            priority: 'MEDIUM',
          },
        },
        example2: {
          summary: 'Обновление контактных данных',
          value: {
            phone: '+79998887766',
            email: 'ivan.new@example.com',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Клиент успешно обновлен',
      schema: {
        example: {
          id: 1,
          name: 'Иван Сидоров',
          email: 'ivan@example.com',
          phone: '+79991234567',
          company: 'ООО Ромашка',
          position: 'Директор',
          address: 'ул. Ленина, 10',
          city: 'Москва',
          country: 'Россия',
          status: 'ACTIVE',
          priority: 'MEDIUM',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-20T12:00:00.000Z',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Клиент не найден',
    }),
    ApiBadRequestResponse({
      description: 'Некорректные данные обновления',
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
    ApiForbiddenResponse({
      description: 'Нет прав на редактирование',
    }),
  );
}

// ========== DELETE /client/:id ==========
export function DocsRemoveClient() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить клиента',
      description: 'Удаляет клиента и отвязывает его продажи',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID клиента',
      example: 1,
      required: true,
    }),
    ApiOkResponse({
      description: 'Клиент успешно удален',
      schema: {
        example: {
          id: 1,
          name: 'Иван Петров',
          email: 'ivan@example.com',
          message: 'Client deleted successfully',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Клиент не найден',
      schema: {
        example: {
          statusCode: 404,
          message: 'Client with ID 1 not found',
          error: 'Not Found',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
    ApiForbiddenResponse({
      description: 'Нет прав на удаление',
    }),
  );
}
