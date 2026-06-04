import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateBoardDto, AddMemberDto, UpdateBoardDto } from './boards.dto';

// ========== GET /boards ==========
export function DocsGetAllBoards() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить все доски пользователя',
      description:
        'Возвращает список всех досок, где пользователь является участником',
    }),
    ApiOkResponse({
      description: 'Список досок успешно получен',
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
  );
}

// ========== GET /boards/:id ==========
export function DocsGetBoardById() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить доску по ID',
      description:
        'Возвращает детальную информацию о доске с колонками и задачами',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID доски',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Доска успешно получена',
    }),
    ApiNotFoundResponse({
      description: 'Доска не найдена',
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
  );
}

// ========== POST /boards ==========
export function DocsCreateBoard() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создать новую доску',
      description:
        'Создает новую доску и автоматически создает стандартные колонки',
    }),
    ApiBody({
      description: 'Данные для создания доски',
      type: CreateBoardDto,
    }),
    ApiCreatedResponse({
      description: 'Доска успешно создана',
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
  );
}

// ========== PUT /boards/:id ==========
export function DocsUpdateBoard() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить доску',
      description:
        'Обновляет информацию о доске. Требуются права OWNER или EDITOR',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID доски',
      example: 1,
    }),
    ApiBody({
      description: 'Данные для обновления',
      type: UpdateBoardDto,
    }),
    ApiOkResponse({
      description: 'Доска успешно обновлена',
    }),
    ApiNotFoundResponse({
      description: 'Доска не найдена',
    }),
    ApiForbiddenResponse({
      description: 'Нет прав на редактирование',
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
  );
}

// ========== DELETE /boards/:id ==========
export function DocsDeleteBoard() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить доску',
      description:
        'Удаляет доску и все связанные данные. Требуются права OWNER',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID доски',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Доска успешно удалена',
      schema: {
        example: { message: 'Доска успешно удалена' },
      },
    }),
    ApiNotFoundResponse({
      description: 'Доска не найдена',
    }),
    ApiForbiddenResponse({
      description: 'Нет прав на удаление',
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
  );
}

// ========== POST /boards/:id/members ==========
export function DocsAddMember() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Добавить участника в доску',
      description:
        'Добавляет пользователя в доску с указанной ролью. Требуются права OWNER',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID доски',
      example: 1,
    }),
    ApiBody({
      description: 'Данные для добавления участника',
      type: AddMemberDto,
    }),
    ApiCreatedResponse({
      description: 'Участник успешно добавлен',
      schema: {
        example: {
          id: 1,
          boardId: 1,
          userId: 2,
          role: 'EDITOR',
          user: {
            id: 2,
            name: 'Петр Иванов',
            email: 'petr@example.com',
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Доска или пользователь не найдены',
    }),
    ApiForbiddenResponse({
      description: 'Нет прав на добавление участников',
    }),
  );
}

// ========== PUT /boards/:id/members/:memberId ==========
export function DocsUpdateMemberRole() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Изменить роль участника',
      description: 'Изменяет роль участника в доске. Требуются права OWNER',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID доски',
      example: 1,
    }),
    ApiParam({
      name: 'memberId',
      type: Number,
      description: 'ID записи участника',
      example: 1,
    }),
    ApiBody({
      description: 'Новая роль',
    }),
    ApiOkResponse({
      description: 'Роль успешно изменена',
      schema: {
        example: {
          id: 1,
          boardId: 1,
          userId: 2,
          role: 'VIEWER',
          user: {
            id: 2,
            name: 'Петр Иванов',
            email: 'petr@example.com',
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Доска или участник не найдены',
    }),
    ApiForbiddenResponse({
      description: 'Нет прав на изменение ролей',
    }),
  );
}

// ========== DELETE /boards/:id/members/:memberId ==========
export function DocsRemoveMember() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить участника из доски',
      description: 'Удаляет участника из доски. Требуются права OWNER',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID доски',
      example: 1,
    }),
    ApiParam({
      name: 'memberId',
      type: Number,
      description: 'ID записи участника',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Участник успешно удален',
      schema: {
        example: { message: 'Участник успешно удален' },
      },
    }),
    ApiNotFoundResponse({
      description: 'Доска или участник не найдены',
    }),
    ApiForbiddenResponse({
      description: 'Нет прав на удаление участников',
    }),
  );
}
