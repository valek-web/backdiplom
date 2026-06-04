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
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
  ReorderTasksDto,
} from './tasks.dto';

// ========== GET /tasks/column/:columnId ==========
export function DocsGetTasksByColumn() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить все задачи колонки',
      description: 'Возвращает список всех задач в указанной колонке',
    }),
    ApiParam({
      name: 'columnId',
      type: Number,
      description: 'ID колонки',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Список задач успешно получен',
    }),
    ApiNotFoundResponse({ description: 'Колонка не найдена' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
}

// ========== GET /tasks/:id ==========
export function DocsGetTaskById() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить задачу по ID',
      description: 'Возвращает детальную информацию о задаче',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID задачи',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Задача успешно получена',
    }),
    ApiNotFoundResponse({ description: 'Задача не найдена' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
}

// ========== POST /tasks ==========
export function DocsCreateTask() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создать задачу',
      description:
        'Создает новую задачу в колонке. Требуются права OWNER или EDITOR',
    }),
    ApiQuery({
      name: 'columnId',
      type: Number,
      description: 'ID колонки',
      example: 1,
    }),
    ApiBody({ type: CreateTaskDto }),
    ApiCreatedResponse({
      description: 'Задача успешно создана',
    }),
    ApiNotFoundResponse({ description: 'Колонка не найдена' }),
    ApiForbiddenResponse({ description: 'Нет прав на создание задачи' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
}

// ========== PUT /tasks/:id ==========
export function DocsUpdateTask() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить задачу',
      description:
        'Обновляет информацию о задаче. Требуются права OWNER, EDITOR или автор',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID задачи',
      example: 1,
    }),
    ApiBody({ type: UpdateTaskDto }),
    ApiOkResponse({
      description: 'Задача успешно обновлена',
    }),
    ApiNotFoundResponse({ description: 'Задача не найдена' }),
    ApiForbiddenResponse({ description: 'Нет прав на редактирование' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
}

// ========== DELETE /tasks/:id ==========
export function DocsDeleteTask() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить задачу',
      description: 'Удаляет задачу. Требуются права OWNER, EDITOR или автор',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID задачи',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Задача успешно удалена',
      schema: { example: { message: 'Задача успешно удалена' } },
    }),
    ApiNotFoundResponse({ description: 'Задача не найдена' }),
    ApiForbiddenResponse({ description: 'Нет прав на удаление' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
}

// ========== POST /tasks/:id/move ==========
export function DocsMoveTask() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Переместить задачу',
      description:
        'Перемещает задачу в другую колонку или позицию. Требуются права OWNER, EDITOR или автор',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID задачи',
      example: 1,
    }),
    ApiBody({ type: MoveTaskDto }),
    ApiOkResponse({
      description: 'Задача успешно перемещена',
    }),
    ApiNotFoundResponse({ description: 'Задача или колонка не найдены' }),
    ApiForbiddenResponse({ description: 'Нет прав на перемещение' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
}

// ========== POST /tasks/reorder ==========
export function DocsReorderTasks() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Изменить порядок задач',
      description:
        'Переупорядочивает задачи в колонке. Требуются права OWNER, EDITOR или автор',
    }),
    ApiQuery({
      name: 'columnId',
      type: Number,
      description: 'ID колонки',
      example: 1,
    }),
    ApiBody({ type: ReorderTasksDto }),
    ApiOkResponse({
      description: 'Порядок задач успешно изменен',
      schema: {
        example: {
          message: 'Порядок задач успешно обновлен',
          tasks: [
            { id: 1, title: 'Задача 1', position: 0 },
            { id: 2, title: 'Задача 2', position: 1 },
          ],
        },
      },
    }),
    ApiForbiddenResponse({ description: 'Нет прав на изменение порядка' }),
    ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' }),
  );
}
