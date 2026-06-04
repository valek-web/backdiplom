import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  ArrayMinSize,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({ example: 'В работе', description: 'Название колонки' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: 1,
    description: 'Порядок отображения',
    required: false,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class UpdateColumnDto {
  @ApiProperty({
    example: 'В работе',
    description: 'Название колонки',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    example: 1,
    description: 'Порядок отображения',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class ReorderColumnsDto {
  @ApiProperty({
    example: [1, 2, 3, 4],
    description: 'Массив ID колонок в новом порядке',
  })
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  columnIds: number[];
}

class TaskDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Сделать авторизацию' })
  title: string;

  @ApiProperty({ example: 'Нужно добавить JWT', required: false })
  description?: string;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ example: '2024-01-01T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T12:00:00Z' })
  updatedAt: Date;
}

export class ColumnResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'В работе' })
  title: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ type: () => [TaskDto] })
  tasks: TaskDto[];

  @ApiProperty({ example: '2024-01-01T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T12:00:00Z' })
  updatedAt: Date;
}
