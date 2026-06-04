import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VideoUpdateDto {
  @ApiProperty({
    example: 'new_name',
    description: 'Новое название видео',
  })
  @IsString()
  name: string;
}
