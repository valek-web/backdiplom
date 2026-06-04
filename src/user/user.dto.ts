import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserUpdateDto {
  @ApiProperty()
  @IsString()
  name: string;
}
