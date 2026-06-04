import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ImageUpdateDto {
  @ApiProperty({
    example: 'new_name',
    description: 'Новое название картинки',
  })
  @IsString()
  name: string;
}
