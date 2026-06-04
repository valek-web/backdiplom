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
  ApiQuery,
} from '@nestjs/swagger';
import { CreateSaleDto, UpdateSaleDto, AddCommentDto } from './sale.dto';

// ========== POST /sale ==========
export function DocsCreateSale() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создать новую продажу',
      description: 'Создает новую запись о продаже/сделке в системе',
    }),
    ApiBody({
      description: 'Данные для создания продажи',
      type: CreateSaleDto,
      examples: {
        example1: {
          summary: 'Пример создания продажи',
          value: {
            title: 'Продажа оборудования для офиса',
            description: 'Комплексная поставка офисного оборудования',
            amount: 1500000,
            clientId: 1,
            managerId: 5,
            products: [
              { name: 'Ноутбук Lenovo', quantity: 3, price: 75000 },
              { name: 'Монитор 24"', quantity: 3, price: 25000 },
            ],
            comments: ['Клиент заинтересован', 'Отправлено КП'],
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Продажа успешно создана',
      schema: {
        example: {
          id: 1,
          title: 'Продажа оборудования для офиса',
          description: 'Комплексная поставка офисного оборудования',
          amount: 1500000,
          clientId: 1,
          managerId: 5,
          products: [
            { name: 'Ноутбук Lenovo', quantity: 3, price: 75000 },
            { name: 'Монитор 24"', quantity: 3, price: 25000 },
          ],
          comments: ['Клиент заинтересован', 'Отправлено КП'],
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          closedAt: null,
          client: {
            id: 1,
            name: 'Иван Петров',
            email: 'ivan@example.com',
          },
          manager: {
            id: 5,
            email: 'manager@example.com',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Некорректные данные запроса',
    }),
    ApiNotFoundResponse({
      description: 'Клиент или менеджер не найдены',
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
    ApiForbiddenResponse({
      description: 'Нет доступа к этому ресурсу',
    }),
  );
}

// ========== GET /sale ==========
export function DocsFindAllSales() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить все продажи',
      description:
        'Возвращает список всех продаж с информацией о клиентах и менеджерах',
    }),
    ApiOkResponse({
      description: 'Список продаж успешно получен',
      schema: {
        example: [
          {
            id: 1,
            title: 'Продажа оборудования',
            amount: 1500000,
            createdAt: '2024-01-15T10:30:00.000Z',
            client: {
              id: 1,
              name: 'Иван Петров',
            },
            manager: {
              id: 5,
              email: 'manager@example.com',
            },
          },
        ],
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
  );
}

// ========== PATCH /sale/:id ==========
export function DocsUpdateSale() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить данные продажи',
      description: 'Обновляет информацию о продаже. Все поля опциональны',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID продажи',
      example: 1,
      required: true,
    }),
    ApiBody({
      description: 'Данные для обновления',
      type: UpdateSaleDto,
      examples: {
        example1: {
          summary: 'Обновление суммы и заголовка',
          value: {
            title: 'Обновленная продажа',
            amount: 1750000,
          },
        },
        example2: {
          summary: 'Закрытие сделки',
          value: {
            closedAt: '2024-02-15T14:30:00.000Z',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Продажа успешно обновлена',
    }),
    ApiNotFoundResponse({
      description: 'Продажа не найдена',
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

// ========== DELETE /sale/:id ==========
export function DocsRemoveSale() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить продажу',
      description: 'Удаляет запись о продаже из системы',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID продажи',
      example: 1,
      required: true,
    }),
    ApiOkResponse({
      description: 'Продажа успешно удалена',
      schema: {
        example: {
          id: 1,
          title: 'Продажа оборудования',
          message: 'Sale deleted successfully',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Продажа не найдена',
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
    ApiForbiddenResponse({
      description: 'Нет прав на удаление',
    }),
  );
}

// ========== GET /sale/client/:clientId ==========
export function DocsFindSalesByClient() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить продажи клиента',
      description: 'Возвращает все продажи указанного клиента',
    }),
    ApiParam({
      name: 'clientId',
      type: Number,
      description: 'ID клиента',
      example: 1,
      required: true,
    }),
    ApiOkResponse({
      description: 'Список продаж клиента успешно получен',
    }),
    ApiNotFoundResponse({
      description: 'Клиент не найден',
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
  );
}

// ========== GET /sale/manager/:managerId ==========
export function DocsFindSalesByManager() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить продажи менеджера',
      description: 'Возвращает все продажи, которые ведет указанный менеджер',
    }),
    ApiParam({
      name: 'managerId',
      type: Number,
      description: 'ID менеджера',
      example: 5,
      required: true,
    }),
    ApiOkResponse({
      description: 'Список продаж менеджера успешно получен',
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
  );
}

// ========== POST /sale/:id/comments ==========
export function DocsAddComment() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Добавить комментарий к продаже',
      description: 'Добавляет новый комментарий к существующей продаже',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID продажи',
      example: 1,
      required: true,
    }),
    ApiBody({
      description: 'Комментарий',
      type: AddCommentDto,
      examples: {
        example1: {
          summary: 'Добавление комментария',
          value: {
            comment: 'Клиент запросил дополнительную информацию',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Комментарий успешно добавлен',
      schema: {
        example: {
          id: 1,
          comments: [
            'Клиент заинтересован',
            'Отправлено КП',
            'Клиент запросил дополнительную информацию',
          ],
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Продажа не найдена',
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
  );
}
