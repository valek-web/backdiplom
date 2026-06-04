import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  IsEnum,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Role } from 'src/generated/prisma/enums';

export class CreateBoardDto {
  @ApiProperty({ example: 'Мой проект', description: 'Название доски' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Описание проекта',
    description: 'Описание доски',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}

export class UpdateBoardDto extends PartialType(CreateBoardDto) {}

export class AddMemberDto {
  @ApiProperty({ example: 2, description: 'ID пользователя' })
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 'EDITOR',
    description: 'Роль пользователя',
    enum: Role,
  })
  @IsEnum(Role)
  role: Role;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ example: 'VIEWER', description: 'Новая роль', enum: Role })
  @IsEnum(Role)
  role: Role;
}
