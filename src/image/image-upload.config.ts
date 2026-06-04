import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';

// Функция для транслитерации кириллицы
function transliterate(text: string): string {
  const ru = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'kh',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',

    А: 'A',
    Б: 'B',
    В: 'V',
    Г: 'G',
    Д: 'D',
    Е: 'E',
    Ё: 'Yo',
    Ж: 'Zh',
    З: 'Z',
    И: 'I',
    Й: 'Y',
    К: 'K',
    Л: 'L',
    М: 'M',
    Н: 'N',
    О: 'O',
    П: 'P',
    Р: 'R',
    С: 'S',
    Т: 'T',
    У: 'U',
    Ф: 'F',
    Х: 'Kh',
    Ц: 'Ts',
    Ч: 'Ch',
    Ш: 'Sh',
    Щ: 'Sch',
    Ъ: '',
    Ы: 'Y',
    Ь: '',
    Э: 'E',
    Ю: 'Yu',
    Я: 'Ya',
  };

  return text.replace(/[а-яёА-ЯЁ]/g, (char) => ru[char] || char);
}

// Функция для очистки имени файла
function sanitizeFilename(filename: string): string {
  // Транслитерируем кириллицу
  let result = transliterate(filename);

  // Удаляем все спецсимволы, оставляем буквы, цифры, дефисы и подчеркивания
  result = result.replace(/[^\w\s\-_.]/g, '');

  // Заменяем пробелы на дефисы
  result = result.replace(/\s+/g, '-');

  return result;
}

export const imageUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: (
      req: Express.Request,
      file: Express.Multer.File,
      callback: (error: Error | null, destination: string) => void,
    ) => {
      const uploadsDir = './uploads/images';

      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
      }
      callback(null, uploadsDir);
    },
    filename: (
      req: Express.Request,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void,
    ) => {
      // Оригинальное имя с правильной кодировкой
      const originalName = Buffer.from(file.originalname, 'latin1').toString(
        'utf8',
      );

      // Очищаем имя файла
      const cleanName = sanitizeFilename(originalName);
      const ext = extname(originalName);

      // Убираем расширение из имени
      const nameWithoutExt = cleanName.replace(/\.[^/.]+$/, '');

      let filename = `${nameWithoutExt}${ext}`;
      let counter = 1;

      const uploadsDir = './uploads/images';

      // Если файл уже существует, добавляем к имени номер
      while (existsSync(`${uploadsDir}/${filename}`)) {
        filename = `${nameWithoutExt} (${counter})${ext}`;
        counter++;
      }

      callback(null, filename);
    },
  }),
  fileFilter: (
    req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException(
          `Неподдерживаемый тип файла. Разрешены: ${allowedMimeTypes.join(', ')}`,
        ),
        false,
      );
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB для изображений
  },
};
