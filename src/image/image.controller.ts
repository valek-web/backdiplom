import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { AuthGuard } from '../common/guards/jwt-auth.guard';
import { imageUploadOptions } from './image-upload.config';
import { ImageUpdateDto } from './image.dto';
import {
  DocsDeleteImage,
  DocsGetAllImages,
  DocsRenameImage,
  DocsUploadImage,
} from './image.docs';

@Controller('image')
@UseGuards(AuthGuard)
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get()
  @DocsGetAllImages()
  findAll() {
    return this.imageService.findAll();
  }

  @Post()
  @DocsUploadImage()
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async create(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл изображения не был загружен');
    }

    return this.imageService.create(file);
  }

  @Put(':id')
  @DocsRenameImage()
  async rename(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateName: ImageUpdateDto,
  ) {
    return this.imageService.rename(id, updateName.name);
  }

  @Delete(':id')
  @DocsDeleteImage()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.imageService.delete(id);
  }
}
