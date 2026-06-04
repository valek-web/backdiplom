import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class ImageService {
  constructor(private readonly db: DbService) {}

  async findAll() {
    const images = await this.db.image.findMany({});
    return images;
  }

  async create(file: Express.Multer.File) {
    // Проверяем уникальность пути файла
    const existingImage = await this.db.image.findUnique({
      where: { path: `/uploads/images/${file.filename}` },
    });

    if (existingImage) {
      // Удаляем загруженный файл, так как он не будет использован
      await this.deleteImageFile(file.path);
      throw new ConflictException(
        `Изображение с именем "${file.filename}" уже существует`,
      );
    }

    const imageCreate = await this.db.image.create({
      data: {
        path: `/uploads/images/${file.filename}`,
      },
    });

    return imageCreate;
  }

  async rename(id: number, newName: string) {
    // Проверяем существование изображения
    const image = await this.db.image.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException(`Изображение с ID ${id} не найдено`);
    }

    // Проверяем корректность нового имени
    if (!newName || newName.trim() === '') {
      throw new BadRequestException('Новое имя не может быть пустым');
    }

    // Удаляем расширение из нового имени, если оно было указано
    const nameWithoutExt = path.parse(newName).name;
    const originalExt = path.extname(image.path);
    const finalNewName = nameWithoutExt + originalExt;

    // Проверяем, изменилось ли имя
    const currentFilename = path.basename(image.path);
    if (finalNewName === currentFilename) {
      throw new BadRequestException('Новое имя совпадает с текущим');
    }

    // Проверяем, существует ли уже файл с таким именем
    const existingImage = await this.db.image.findFirst({
      where: {
        path: `/uploads/images/${finalNewName}`,
        id: { not: id }, // Исключаем текущее изображение из проверки
      },
    });

    if (existingImage) {
      throw new ConflictException(
        `Изображение с именем "${finalNewName}" уже существует`,
      );
    }

    // Подготавливаем пути
    const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
    const oldPath = path.join(uploadsDir, currentFilename);
    const newPath = path.join(uploadsDir, finalNewName);
    const newPathInDb = `/uploads/images/${finalNewName}`;

    try {
      // Проверяем существование старого файла
      await fs.access(oldPath);

      // Переименовываем файл на диске
      await fs.rename(oldPath, newPath);
    } catch (err) {
      console.error(`Ошибка переименования файла: ${err.message}`);

      if (err.code === 'ENOENT') {
        throw new NotFoundException(
          `Файл изображения не найден на диске: ${currentFilename}`,
        );
      }

      throw new Error(`Не удалось переименовать файл: ${err.message}`);
    }

    // Обновляем запись в базе данных
    const updateImage = await this.db.image.update({
      where: { id },
      data: {
        path: newPathInDb,
      },
    });

    return updateImage;
  }

  async delete(id: number) {
    const image = await this.db.image.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException(`Изображение с ID ${id} не найдено`);
    }

    const isSuccess = await this.deleteImageFile(image.path);

    if (!isSuccess) {
      throw new Error(`Не удалось удалить файл изображения: ${image.path}`);
    }

    const ImageDelete = await this.db.image.delete({
      where: { id },
    });

    return ImageDelete;
  }

  private async deleteImageFile(imagePath: string) {
    try {
      const filename = path.basename(imagePath);
      const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
      const fullPath = path.join(uploadsDir, filename);

      await fs.unlink(fullPath);
      return true;
    } catch (err) {
      console.error(`Ошибка удаления файла изображения: ${err.message}`);
      return false;
    }
  }
}
