import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CreateColumnDto,
  UpdateColumnDto,
  ReorderColumnsDto,
  ColumnResponseDto,
} from './columns.dto';

export function DocsGetColumnsByBoard() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить все колонки доски',
      description: 'Возвращает список всех колонок указанной доски с задачами',
    }),
    ApiParam({
      name: 'boardId',
      type: Number,
      description: 'ID доски',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Список колонок успешно получен',
      type: [ColumnResponseDto],
    }),
    ApiNotFoundResponse({ description: 'Доска не найдена' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
}

export function DocsGetColumnById() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить колонку по ID',
      description: 'Возвращает информацию о колонке и её задачах',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID колонки',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Колонка успешно получена',
      type: ColumnResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Колонка не найдена' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
}

export function DocsCreateColumn() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создать колонку',
      description:
        'Создает новую колонку в доске. Требуются права OWNER или EDITOR',
    }),
    ApiQuery({
      name: 'boardId',
      type: Number,
      description: 'ID доски',
      example: 1,
    }),
    ApiBody({ type: CreateColumnDto }),
    ApiCreatedResponse({
      description: 'Колонка успешно создана',
      type: ColumnResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Доска не найдена' }),
    ApiForbiddenResponse({ description: 'Нет прав на создание колонки' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
}

export function DocsUpdateColumn() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить колонку',
      description:
        'Обновляет информацию о колонке. Требуются права OWNER или EDITOR',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID колонки',
      example: 1,
    }),
    ApiBody({ type: UpdateColumnDto }),
    ApiOkResponse({
      description: 'Колонка успешно обновлена',
      type: ColumnResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Колонка не найдена' }),
    ApiForbiddenResponse({ description: 'Нет прав на редактирование' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
}

export function DocsDeleteColumn() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить колонку',
      description: 'Удаляет колонку и все задачи в ней. Требуются права OWNER',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID колонки',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Колонка успешно удалена',
      schema: { example: { message: 'Колонка успешно удалена' } },
    }),
    ApiNotFoundResponse({ description: 'Колонка не найдена' }),
    ApiForbiddenResponse({ description: 'Нет прав на удаление' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
}

export function DocsReorderColumns() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Изменить порядок колонок',
      description:
        'Переупорядочивает колонки в доске. Требуются права OWNER или EDITOR',
    }),
    ApiQuery({
      name: 'boardId',
      type: Number,
      description: 'ID доски',
      example: 1,
    }),
    ApiBody({ type: ReorderColumnsDto }),
    ApiOkResponse({
      description: 'Порядок колонок успешно изменен',
      schema: {
        example: {
          message: 'Порядок колонок успешно обновлен',
          columns: [
            { id: 1, title: 'В очереди', order: 0, tasks: [] },
            { id: 2, title: 'В работе', order: 1, tasks: [] },
          ],
        },
      },
    }),
    ApiForbiddenResponse({ description: 'Нет прав на изменение порядка' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
}
