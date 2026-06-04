import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

// GET /image
export function DocsGetAllImages() {
  const exampleResponse = [
    {
      id: 1,
      path: '/uploads/images/image1.jpg',
      createdAt: '2024-01-01T12:00:00Z',
    },
    {
      id: 2,
      path: '/uploads/images/image2.jpg',
      createdAt: '2024-01-02T12:00:00Z',
    },
    {
      id: 3,
      path: '/uploads/images/image3.jpg',
      createdAt: '2024-01-03T12:00:00Z',
    },
  ];

  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить все изображения',
      description: 'Возвращает список всех загруженных изображений',
    }),
    ApiOkResponse({
      description: 'Список изображений успешно получен',
      schema: {
        type: 'array',
        example: exampleResponse,
      },
    }),
  );
}

// POST /image
export function DocsUploadImage() {
  const exampleResponse = {
    id: 4,
    path: '/uploads/images/new-image.jpg',
    createdAt: '2024-01-04T12:00:00Z',
  };

  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Загрузить изображение',
      description: 'Загружает новое изображение на сервер',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Файл изображения',
      schema: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            format: 'binary',
            description: 'Файл изображения (jpg, png, gif, webp)',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Изображение успешно загружено',
      schema: {
        example: exampleResponse,
      },
    }),
  );
}

// PUT /image/:id
export function DocsRenameImage() {
  const exampleBody = {
    name: 'новое-название',
  };

  const exampleResponse = {
    id: 1,
    path: '/uploads/images/новое-название.jpg',
    createdAt: '2024-01-01T12:00:00Z',
  };

  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Переименовать изображение',
      description: 'Изменяет название файла изображения',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID изображения',
      example: 1,
    }),
    ApiBody({
      description: 'Новое название',
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'новое-название',
            description: 'Новое название (без расширения)',
          },
        },
        example: exampleBody,
      },
    }),
    ApiOkResponse({
      description: 'Изображение успешно переименовано',
      schema: {
        example: exampleResponse,
      },
    }),
  );
}

// DELETE /image/:id
export function DocsDeleteImage() {
  const exampleResponse = {
    id: 3,
    path: '/uploads/images/image3.jpg',
    createdAt: '2024-01-03T12:00:00Z',
  };

  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить изображение',
      description: 'Удаляет изображение с сервера и из базы данных',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID изображения',
      example: 3,
    }),
    ApiOkResponse({
      description: 'Изображение успешно удалено',
      schema: {
        example: exampleResponse,
      },
    }),
  );
}
