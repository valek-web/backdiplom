import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

// GET /video
export function DocsGetAllVideos() {
  const exampleResponse = [
    {
      id: 1,
      path: '/uploads/videos/video1.mp4',
      createdAt: '2024-01-01T12:00:00Z',
    },
    {
      id: 2,
      path: '/uploads/videos/video2.mp4',
      createdAt: '2024-01-02T12:00:00Z',
    },
    {
      id: 3,
      path: '/uploads/videos/video3.mp4',
      createdAt: '2024-01-03T12:00:00Z',
    },
  ];

  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить все видео',
      description: 'Возвращает список всех загруженных видео',
    }),
    ApiOkResponse({
      description: 'Список видео успешно получен',
      schema: {
        type: 'array',
        example: exampleResponse,
      },
    }),
  );
}

// POST /video
export function DocsUploadVideo() {
  const exampleResponse = {
    id: 4,
    path: '/uploads/videos/new-video.mp4',
    createdAt: '2024-01-04T12:00:00Z',
  };

  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Загрузить видео',
      description: 'Загружает новое видео на сервер',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Файл видео',
      schema: {
        type: 'object',
        properties: {
          video: {
            type: 'string',
            format: 'binary',
            description: 'Файл видео (mp4, mov, avi, mkv)',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Видео успешно загружено',
      schema: {
        example: exampleResponse,
      },
    }),
  );
}

// PUT /video/:id
export function DocsRenameVideo() {
  const exampleBody = {
    name: 'новое-название-видео',
  };

  const exampleResponse = {
    id: 1,
    path: '/uploads/videos/новое-название-видео.mp4',
    createdAt: '2024-01-01T12:00:00Z',
  };

  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Переименовать видео',
      description: 'Изменяет название файла видео',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID видео',
      example: 1,
    }),
    ApiBody({
      description: 'Новое название',
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'новое-название-видео',
            description: 'Новое название (без расширения)',
          },
        },
        example: exampleBody,
      },
    }),
    ApiOkResponse({
      description: 'Видео успешно переименовано',
      schema: {
        example: exampleResponse,
      },
    }),
  );
}

// DELETE /video/:id
export function DocsDeleteVideo() {
  const exampleResponse = {
    id: 3,
    path: '/uploads/videos/video3.mp4',
    createdAt: '2024-01-03T12:00:00Z',
  };

  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить видео',
      description: 'Удаляет видео с сервера и из базы данных',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID видео',
      example: 3,
    }),
    ApiOkResponse({
      description: 'Видео успешно удалено',
      schema: {
        example: exampleResponse,
      },
    }),
  );
}
