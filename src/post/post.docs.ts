// post.docs.ts
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
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  UpdateCommentDto,
} from './post.dto';

// ========== GET /posts ==========
export function DocsGetAllPosts() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить все посты',
      description: 'Возвращает список всех постов с пагинацией и комментариями',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Номер страницы (по умолчанию 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Количество постов на странице (по умолчанию 10)',
      example: 10,
    }),
    ApiOkResponse({
      description: 'Список постов успешно получен',
      schema: {
        example: {
          posts: [
            {
              id: 1,
              content: 'Содержимое поста...',
              authorId: 1,
              author: {
                id: 1,
                name: 'Иван Петров',
                email: 'ivan@example.com',
              },
              imageId: 1,
              images: {
                id: 1,
                path: '/uploads/images/photo.jpg',
              },
              videoId: 1,
              videos: {
                id: 1,
                path: '/uploads/videos/video.mp4',
              },
              likes: [],
              comments: [],
              commentsCount: 5,
              viewCount: 150,
              publishedAt: '2024-12-25T10:00:00Z',
              createdAt: '2024-12-20T10:00:00Z',
              updatedAt: '2024-12-25T10:00:00Z',
            },
          ],
          total: 42,
        },
      },
    }),
  );
}

// ========== POST /posts ==========
export function DocsCreatePost() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создать пост',
      description: 'Создает новый пост. Требуется право WRITE_POST',
    }),
    ApiBody({
      description: 'Данные для создания поста',
      type: CreatePostDto,
      examples: {
        example1: {
          summary: 'Пример запроса',
          value: {
            content: 'Содержимое поста...',
            imageId: 1,
            videoId: 1,
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Пост успешно создан',
      schema: {
        example: {
          id: 1,
          content: 'Содержимое поста...',
          authorId: 1,
          author: {
            id: 1,
            name: 'Иван Петров',
            email: 'ivan@example.com',
          },
          imageId: 1,
          images: {
            id: 1,
            path: '/uploads/images/photo.jpg',
          },
          videoId: 1,
          videos: {
            id: 1,
            path: '/uploads/videos/video.mp4',
          },
          likes: [],
          viewCount: 0,
          publishedAt: '2024-12-25T10:00:00Z',
          createdAt: '2024-12-25T10:00:00Z',
          updatedAt: '2024-12-25T10:00:00Z',
        },
      },
    }),
  );
}

// ========== PUT /posts/:id ==========
export function DocsUpdatePost() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить пост',
      description:
        'Обновляет существующий пост. Требуется право WRITE_POST или быть автором',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID поста',
      example: 1,
    }),
    ApiBody({
      description: 'Данные для обновления поста',
      type: UpdatePostDto,
      examples: {
        example1: {
          summary: 'Пример запроса',
          value: {
            content: 'Обновленное содержимое...',
            imageId: 2,
            videoId: 2,
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Пост успешно обновлен',
      schema: {
        example: {
          id: 1,
          content: 'Обновленное содержимое...',
          authorId: 1,
          author: {
            id: 1,
            name: 'Иван Петров',
            email: 'ivan@example.com',
          },
          imageId: 2,
          images: {
            id: 2,
            path: '/uploads/images/new-photo.jpg',
          },
          videoId: 2,
          videos: {
            id: 2,
            path: '/uploads/videos/new-video.mp4',
          },
          likes: [],
          comments: [],
          viewCount: 150,
          publishedAt: '2024-12-25T10:00:00Z',
          createdAt: '2024-12-20T10:00:00Z',
          updatedAt: '2024-12-26T10:00:00Z',
        },
      },
    }),
  );
}

// ========== DELETE /posts/:id ==========
export function DocsDeletePost() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить пост',
      description:
        'Удаляет существующий пост. Требуется право WRITE_POST или быть автором',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID поста',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Пост успешно удален',
      schema: {
        example: {
          message: 'Пост успешно удален',
        },
      },
    }),
  );
}

// ========== POST /posts/:id/like ==========
export function DocsLikePost() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Поставить лайк посту',
      description: 'Добавляет лайк к посту. Требуется право READ_POST',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID поста',
      example: 1,
    }),
    ApiCreatedResponse({
      description: 'Лайк успешно поставлен',
      schema: {
        example: {
          liked: true,
          likesCount: 42,
        },
      },
    }),
  );
}

// ========== DELETE /posts/:id/like ==========
export function DocsUnlikePost() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Убрать лайк с поста',
      description: 'Удаляет лайк с поста. Требуется право READ_POST',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID поста',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Лайк успешно убран',
      schema: {
        example: {
          liked: false,
          likesCount: 41,
        },
      },
    }),
  );
}

// ========== POST /posts/:id/comments ==========
export function DocsAddComment() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Добавить комментарий к посту',
      description:
        'Добавляет новый комментарий к посту. Требуется право READ_POST',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID поста',
      example: 1,
    }),
    ApiBody({
      description: 'Данные для создания комментария',
      type: CreateCommentDto,
      examples: {
        example1: {
          summary: 'Пример запроса',
          value: {
            content: 'Отличный пост! Спасибо!',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Комментарий успешно добавлен',
      schema: {
        example: {
          id: 1,
          content: 'Отличный пост! Спасибо!',
          postId: 1,
          userId: 1,
          user: {
            id: 1,
            name: 'Иван Петров',
            email: 'ivan@example.com',
          },
          createdAt: '2024-12-25T10:00:00Z',
        },
      },
    }),
  );
}

// ========== GET /posts/:id/comments ==========
export function DocsGetComments() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить комментарии к посту',
      description: 'Возвращает список комментариев к посту с пагинацией',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID поста',
      example: 1,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Номер страницы (по умолчанию 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Количество комментариев на странице (по умолчанию 20)',
      example: 20,
    }),
    ApiOkResponse({
      description: 'Список комментариев успешно получен',
      schema: {
        example: {
          comments: [
            {
              id: 1,
              content: 'Отличный пост! Спасибо!',
              postId: 1,
              userId: 1,
              user: {
                id: 1,
                name: 'Иван Петров',
                email: 'ivan@example.com',
              },
              createdAt: '2024-12-25T10:00:00Z',
            },
          ],
          total: 15,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      },
    }),
  );
}

// ========== PUT /posts/comments/:commentId ==========
export function DocsUpdateComment() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить комментарий',
      description:
        'Обновляет существующий комментарий. Требуется право WRITE_POST или быть автором',
    }),
    ApiParam({
      name: 'commentId',
      type: Number,
      description: 'ID комментария',
      example: 1,
    }),
    ApiBody({
      description: 'Данные для обновления комментария',
      type: UpdateCommentDto,
      examples: {
        example1: {
          summary: 'Пример запроса',
          value: {
            content: 'Обновленный текст комментария...',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Комментарий успешно обновлен',
      schema: {
        example: {
          id: 1,
          content: 'Обновленный текст комментария...',
          postId: 1,
          userId: 1,
          user: {
            id: 1,
            name: 'Иван Петров',
            email: 'ivan@example.com',
          },
          createdAt: '2024-12-25T10:00:00Z',
        },
      },
    }),
  );
}

// ========== DELETE /posts/comments/:commentId ==========
export function DocsDeleteComment() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить комментарий',
      description:
        'Удаляет существующий комментарий. Требуется право WRITE_POST или быть автором',
    }),
    ApiParam({
      name: 'commentId',
      type: Number,
      description: 'ID комментария',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Комментарий успешно удален',
      schema: {
        example: {
          message: 'Комментарий успешно удален',
        },
      },
    }),
  );
}
