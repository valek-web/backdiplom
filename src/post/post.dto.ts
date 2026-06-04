import {
  IsString,
  IsOptional,
  IsInt,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'Содержимое поста...', description: 'Контент поста' })
  @IsString()
  content: string;

  @ApiProperty({ example: 1, description: 'ID изображения' })
  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  imageId: number;

  @ApiProperty({ example: 1, description: 'ID видео' })
  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  videoId: number;
}

export class CreateCommentDto {
  @ApiProperty({
    example: 'Текст комментария...',
    description: 'Содержимое комментария',
  })
  @IsString()
  @MinLength(1)
  content: string;
}

export class UpdateCommentDto {
  @ApiProperty({
    example: 'Обновленный текст комментария...',
    description: 'Новое содержимое комментария',
  })
  @IsString()
  @MinLength(1)
  content: string;
}
export class UpdatePostDto extends PartialType(CreatePostDto) {}
