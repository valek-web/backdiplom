import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  Min,
  MaxLength,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// ========== CREATE TASK ==========
export class CreateTaskDto {
  @ApiProperty({
    example: 'Сделать авторизацию',
    description: 'Название задачи',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Нужно добавить JWT токены',
    description: 'Описание задачи',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '2024-04-01T10:00:00Z',
    description: 'Дата начала',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    example: '2024-04-10T10:00:00Z',
    description: 'Дата окончания',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({ example: 2, description: 'ID исполнителя', required: false })
  @IsInt()
  @IsOptional()
  assigneeId?: number;

  @ApiProperty({
    example: ['frontend', 'backend'],
    description: 'Теги задачи',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    example: [1, 2],
    description: 'ID изображений',
    required: false,
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  imageIds?: number[];

  @ApiProperty({ example: [1, 2], description: 'ID видео', required: false })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  videoIds?: number[];
}

// ========== UPDATE TASK ==========
export class UpdateTaskDto {
  @ApiProperty({
    example: 'Обновленное название',
    description: 'Название задачи',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    example: 'Обновленное описание',
    description: 'Описание задачи',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '2024-04-01T10:00:00Z',
    description: 'Дата начала',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    example: '2024-04-10T10:00:00Z',
    description: 'Дата окончания',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({ example: 2, description: 'ID исполнителя', required: false })
  @IsInt()
  @IsOptional()
  assigneeId?: number;

  @ApiProperty({
    example: ['frontend', 'backend'],
    description: 'Теги задачи',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    example: [1, 2],
    description: 'ID изображений',
    required: false,
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  imageIds?: number[];

  @ApiProperty({ example: [1, 2], description: 'ID видео', required: false })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  videoIds?: number[];
}

// ========== MOVE TASK ==========
export class MoveTaskDto {
  @ApiProperty({ example: 2, description: 'ID новой колонки' })
  @IsInt()
  columnId: number;

  @ApiProperty({
    example: 1,
    description: 'Новая позиция в колонке',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;
}

// ========== REORDER TASKS ==========
export class ReorderTasksDto {
  @ApiProperty({
    example: [1, 2, 3, 4],
    description: 'Массив ID задач в новом порядке',
  })
  @IsArray()
  @IsInt({ each: true })
  taskIds: number[];
}
