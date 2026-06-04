import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class VideoService {
  constructor(private readonly db: DbService) {}

  async findAll() {
    const videos = await this.db.video.findMany({});
    return videos;
  }

  async create(file: Express.Multer.File) {
    // Проверяем уникальность пути файла
    const existingVideo = await this.db.video.findUnique({
      where: { path: `/uploads/videos/${file.filename}` },
    });

    if (existingVideo) {
      // Удаляем загруженный файл, так как он не будет использован
      await this.deleteVideoFile(file.path);
      throw new ConflictException(
        `Видео с именем "${file.filename}" уже существует`,
      );
    }

    const createVideo = await this.db.video.create({
      data: {
        path: `/uploads/videos/${file.filename}`,
      },
    });
    return createVideo;
  }

  async rename(id: number, newName: string) {
    // Проверяем существование видео
    const video = await this.db.video.findUnique({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException(`Видео с ID ${id} не найдено`);
    }

    // Проверяем корректность нового имени
    if (!newName || newName.trim() === '') {
      throw new BadRequestException('Новое имя не может быть пустым');
    }

    // Удаляем расширение из нового имени, если оно было указано
    const nameWithoutExt = path.parse(newName).name;
    const originalExt = path.extname(video.path);
    const finalNewName = nameWithoutExt + originalExt;

    // Проверяем, изменилось ли имя
    const currentFilename = path.basename(video.path);
    if (finalNewName === currentFilename) {
      throw new BadRequestException('Новое имя совпадает с текущим');
    }

    // Проверяем, существует ли уже файл с таким именем
    const existingVideo = await this.db.video.findFirst({
      where: {
        path: `/uploads/videos/${finalNewName}`,
        id: { not: id }, // Исключаем текущее видео из проверки
      },
    });

    if (existingVideo) {
      throw new ConflictException(
        `Видео с именем "${finalNewName}" уже существует`,
      );
    }

    // Подготавливаем пути
    const uploadsDir = path.join(process.cwd(), 'uploads', 'videos');
    const oldPath = path.join(uploadsDir, currentFilename);
    const newPath = path.join(uploadsDir, finalNewName);
    const newPathInDb = `/uploads/videos/${finalNewName}`;

    try {
      // Проверяем существование старого файла
      await fs.access(oldPath);

      // Переименовываем файл на диске
      await fs.rename(oldPath, newPath);
    } catch (err) {
      console.error(`Ошибка переименования файла видео: ${err.message}`);

      if (err.code === 'ENOENT') {
        throw new NotFoundException(
          `Файл видео не найден на диске: ${currentFilename}`,
        );
      }

      throw new Error(`Не удалось переименовать файл видео: ${err.message}`);
    }

    // Обновляем запись в базе данных
    const videoUpdate = await this.db.video.update({
      where: { id },
      data: {
        path: newPathInDb,
      },
    });
    return videoUpdate;
  }

  async delete(id: number) {
    const video = await this.db.video.findUnique({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException(`Видео с ID ${id} не найдено`);
    }

    const isSuccess = await this.deleteVideoFile(video.path);

    if (!isSuccess) {
      throw new Error(`Не удалось удалить файл видео: ${video.path}`);
    }

    const deleteVideo = await this.db.video.delete({
      where: { id },
    });
    return deleteVideo;
  }

  private async deleteVideoFile(videoPath: string) {
    try {
      const filename = path.basename(videoPath);
      const uploadsDir = path.join(process.cwd(), 'uploads', 'videos');
      const fullPath = path.join(uploadsDir, filename);

      await fs.unlink(fullPath);
      return true;
    } catch (err) {
      console.error(`Ошибка удаления файла видео: ${err.message}`);
      return false;
    }
  }
}
