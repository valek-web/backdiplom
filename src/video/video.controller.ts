import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Body,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { videoUploadOptions } from './video-upload.config';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { VideoUpdateDto } from './video.dto';
import {
  DocsDeleteVideo,
  DocsGetAllVideos,
  DocsRenameVideo,
  DocsUploadVideo,
} from './video.docs';

@Controller('video')
@UseGuards(AuthGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  @DocsGetAllVideos()
  async findAll() {
    return this.videoService.findAll();
  }

  @Post()
  @DocsUploadVideo()
  @UseInterceptors(FileInterceptor('video', videoUploadOptions))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл видео не был загружен');
    }

    return this.videoService.create(file);
  }

  @Put(':id')
  @DocsRenameVideo()
  rename(
    @Param('id', ParseIntPipe) id: number,
    @Body() renameVideoDto: VideoUpdateDto,
  ) {
    return this.videoService.rename(id, renameVideoDto.name);
  }

  @Delete(':id')
  @DocsDeleteVideo()
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.videoService.delete(id);
  }
}
