import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  CreateGroupChatDto,
  UpdateChatDto,
  AddParticipantsDto,
  SendMessageDto,
  GetMessagesDto,
} from './chat.dto';

// ========== GET /chats ==========
export function DocsGetUserChats() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить все чаты пользователя',
      description:
        'Возвращает список всех чатов текущего пользователя с последними сообщениями и количеством непрочитанных',
    }),
    ApiOkResponse({
      description: 'Список чатов успешно получен',
      schema: {
        example: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            type: 'PRIVATE',
            name: null,
            avatar: null,
            description: null,
            displayName: 'Иван Петров',
            displayAvatar: null,
            createdAt: '2024-12-20T10:00:00Z',
            updatedAt: '2024-12-25T10:00:00Z',
            unreadCount: 2,
            lastMessage: {
              id: 101,
              content: 'Привет!',
              userId: 2,
              user: {
                id: 2,
                name: 'Иван Петров',
                email: 'ivan@example.com',
              },
              createdAt: '2024-12-25T09:55:00Z',
            },
            participantRole: 'MEMBER',
            participants: [
              {
                id: 'participant-1',
                userId: 1,
                user: {
                  id: 1,
                  name: 'Текущий пользователь',
                  email: 'user@example.com',
                },
                role: 'MEMBER',
                unreadCount: 0,
                lastReadAt: '2024-12-25T09:50:00Z',
              },
              {
                id: 'participant-2',
                userId: 2,
                user: {
                  id: 2,
                  name: 'Иван Петров',
                  email: 'ivan@example.com',
                },
                role: 'MEMBER',
                unreadCount: 2,
                lastReadAt: '2024-12-25T09:00:00Z',
              },
            ],
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            type: 'GROUP',
            name: 'Команда проекта',
            avatar: '/uploads/avatars/team.jpg',
            description: 'Обсуждение проекта',
            displayName: 'Команда проекта',
            displayAvatar: '/uploads/avatars/team.jpg',
            createdAt: '2024-12-22T10:00:00Z',
            updatedAt: '2024-12-24T15:30:00Z',
            unreadCount: 5,
            lastMessage: {
              id: 105,
              content: 'Встреча завтра в 11:00',
              userId: 3,
              user: {
                id: 3,
                name: 'Петр Сидоров',
                email: 'petr@example.com',
              },
              createdAt: '2024-12-24T15:30:00Z',
            },
            participantRole: 'ADMIN',
          },
        ],
      },
    }),
  );
}

// ========== POST /chats/private/:userId ==========
export function DocsCreatePrivateChat() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создать личный чат',
      description:
        'Создает новый личный чат с пользователем или возвращает существующий',
    }),
    ApiParam({
      name: 'userId',
      type: Number,
      description: 'ID пользователя для создания чата',
      example: 2,
    }),
    ApiCreatedResponse({
      description: 'Личный чат успешно создан или получен',
      schema: {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'PRIVATE',
          name: null,
          avatar: null,
          description: null,
          createdAt: '2024-12-25T10:00:00Z',
          updatedAt: '2024-12-25T10:00:00Z',
          participants: [
            {
              id: 'participant-1',
              userId: 1,
              user: {
                id: 1,
                name: 'Текущий пользователь',
                email: 'user@example.com',
              },
              role: 'MEMBER',
            },
            {
              id: 'participant-2',
              userId: 2,
              user: {
                id: 2,
                name: 'Иван Петров',
                email: 'ivan@example.com',
              },
              role: 'MEMBER',
            },
          ],
        },
      },
    }),
  );
}

// ========== POST /chats/group ==========
export function DocsCreateGroupChat() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создать групповой чат',
      description: 'Создает новый групповой чат с указанными участниками',
    }),
    ApiBody({
      description: 'Данные для создания группового чата',
      type: CreateGroupChatDto,
      examples: {
        example1: {
          summary: 'Пример запроса',
          value: {
            name: 'Команда проекта',
            description: 'Обсуждение текущих задач проекта',
            avatar: '/uploads/avatars/team.jpg',
            participantIds: [2, 3, 4],
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Групповой чат успешно создан',
      schema: {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          type: 'GROUP',
          name: 'Команда проекта',
          avatar: '/uploads/avatars/team.jpg',
          description: 'Обсуждение текущих задач проекта',
          createdAt: '2024-12-25T10:00:00Z',
          updatedAt: '2024-12-25T10:00:00Z',
          participants: [
            {
              id: 'participant-1',
              userId: 1,
              user: {
                id: 1,
                name: 'Текущий пользователь',
                email: 'user@example.com',
              },
              role: 'OWNER',
            },
            {
              id: 'participant-2',
              userId: 2,
              user: {
                id: 2,
                name: 'Иван Петров',
                email: 'ivan@example.com',
              },
              role: 'MEMBER',
            },
            {
              id: 'participant-3',
              userId: 3,
              user: {
                id: 3,
                name: 'Петр Сидоров',
                email: 'petr@example.com',
              },
              role: 'MEMBER',
            },
          ],
        },
      },
    }),
  );
}

// ========== GET /chats/:id ==========
export function DocsGetChatById() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить информацию о чате',
      description: 'Возвращает детальную информацию о чате и его участниках',
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'ID чата',
      example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    ApiOkResponse({
      description: 'Информация о чате успешно получена',
      schema: {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          type: 'GROUP',
          name: 'Команда проекта',
          avatar: '/uploads/avatars/team.jpg',
          description: 'Обсуждение текущих задач проекта',
          createdAt: '2024-12-25T10:00:00Z',
          updatedAt: '2024-12-25T10:00:00Z',
          participants: [
            {
              id: 'participant-1',
              userId: 1,
              user: {
                id: 1,
                name: 'Текущий пользователь',
                email: 'user@example.com',
              },
              role: 'OWNER',
              unreadCount: 0,
              lastReadAt: '2024-12-25T10:00:00Z',
              joinedAt: '2024-12-25T10:00:00Z',
              isActive: true,
            },
            {
              id: 'participant-2',
              userId: 2,
              user: {
                id: 2,
                name: 'Иван Петров',
                email: 'ivan@example.com',
              },
              role: 'ADMIN',
              unreadCount: 5,
              lastReadAt: '2024-12-25T09:00:00Z',
              joinedAt: '2024-12-25T10:00:00Z',
              isActive: true,
            },
          ],
        },
      },
    }),
  );
}

// ========== PUT /chats/:id ==========
export function DocsUpdateChat() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить информацию о чате',
      description:
        'Обновляет название, описание или аватар группового чата. Требуются права ADMIN или OWNER',
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'ID чата',
      example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    ApiBody({
      description: 'Данные для обновления чата',
      type: UpdateChatDto,
      examples: {
        example1: {
          summary: 'Пример запроса',
          value: {
            name: 'Новое название группы',
            description: 'Обновленное описание',
            avatar: '/uploads/avatars/new-avatar.jpg',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Информация о чате успешно обновлена',
      schema: {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          type: 'GROUP',
          name: 'Новое название группы',
          avatar: '/uploads/avatars/new-avatar.jpg',
          description: 'Обновленное описание',
          createdAt: '2024-12-25T10:00:00Z',
          updatedAt: '2024-12-25T11:00:00Z',
          participants: [],
        },
      },
    }),
  );
}

// ========== POST /chats/:id/participants ==========
export function DocsAddParticipants() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Добавить участников в групповой чат',
      description:
        'Добавляет новых участников в групповой чат. Требуются права ADMIN или OWNER',
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'ID чата',
      example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    ApiBody({
      description: 'Список ID пользователей для добавления',
      type: AddParticipantsDto,
      examples: {
        example1: {
          summary: 'Пример запроса',
          value: {
            userIds: [5, 6, 7],
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Участники успешно добавлены',
      schema: {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          type: 'GROUP',
          name: 'Команда проекта',
          participants: [
            {
              userId: 1,
              user: { id: 1, name: 'Текущий пользователь' },
              role: 'OWNER',
            },
            {
              userId: 5,
              user: { id: 5, name: 'Новый участник 1' },
              role: 'MEMBER',
            },
            {
              userId: 6,
              user: { id: 6, name: 'Новый участник 2' },
              role: 'MEMBER',
            },
          ],
        },
      },
    }),
  );
}

// ========== DELETE /chats/:id/participants/:userId ==========
export function DocsRemoveParticipant() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить участника из группового чата',
      description:
        'Удаляет участника из группового чата. Требуются права ADMIN или OWNER',
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'ID чата',
      example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    ApiParam({
      name: 'userId',
      type: Number,
      description: 'ID пользователя для удаления',
      example: 5,
    }),
    ApiOkResponse({
      description: 'Участник успешно удален',
      schema: {
        example: {
          success: true,
        },
      },
    }),
  );
}

// ========== POST /chats/:id/leave ==========
export function DocsLeaveChat() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Выйти из чата',
      description: 'Выход текущего пользователя из чата',
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'ID чата',
      example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    ApiOkResponse({
      description: 'Выход из чата выполнен успешно',
      schema: {
        example: {
          success: true,
        },
      },
    }),
  );
}

// ========== GET /chats/:id/messages ==========
export function DocsGetMessages() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить сообщения чата',
      description: 'Возвращает историю сообщений в чате с пагинацией',
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'ID чата',
      example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    ApiQuery({
      name: 'cursor',
      required: false,
      type: Number,
      description: 'ID последнего сообщения для пагинации',
      example: 50,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Количество сообщений на странице (по умолчанию 50)',
      example: 50,
    }),
    ApiOkResponse({
      description: 'Сообщения успешно получены',
      schema: {
        example: [
          {
            id: 101,
            content: 'Привет всем!',
            chatId: '123e4567-e89b-12d3-a456-426614174001',
            userId: 1,
            user: {
              id: 1,
              name: 'Текущий пользователь',
              email: 'user@example.com',
            },
            createdAt: '2024-12-25T10:00:00Z',
          },
          {
            id: 102,
            content: 'Привет! Как дела?',
            chatId: '123e4567-e89b-12d3-a456-426614174001',
            userId: 2,
            user: {
              id: 2,
              name: 'Иван Петров',
              email: 'ivan@example.com',
            },
            createdAt: '2024-12-25T10:05:00Z',
          },
        ],
      },
    }),
  );
}

// ========== DELETE /chats/messages/:id ==========
export function DocsDeleteMessage() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить сообщение',
      description:
        'Удаляет сообщение. Только автор сообщения может удалить свое сообщение',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID сообщения',
      example: 101,
    }),
    ApiOkResponse({
      description: 'Сообщение успешно удалено',
      schema: {
        example: {
          success: true,
        },
      },
    }),
  );
}
