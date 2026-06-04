import {
  IsString,
  IsOptional,
  IsInt,
  IsNotEmpty,
  MinLength,
  IsUUID,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ChatType, ChatParticipantRole } from 'src/generated/prisma/enums';

export class CreatePrivateChatDto {
  @ApiProperty({
    example: 2,
    description: 'ID пользователя для создания личного чата',
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;
}

export class CreateGroupChatDto {
  @ApiProperty({
    example: 'Команда проекта',
    description: 'Название группового чата',
    required: true,
  })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    example: 'Обсуждение текущих задач проекта',
    description: 'Описание группы',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '/uploads/avatars/group.jpg',
    description: 'URL аватара группы',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    example: [2, 3, 4],
    description: 'Список ID участников группы',
    required: true,
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  participantIds: number[];
}

export class UpdateChatDto {
  @ApiProperty({
    example: 'Новое название группы',
    description: 'Название группового чата',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Обновленное описание группы',
    description: 'Описание группы',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '/uploads/avatars/new-group.jpg',
    description: 'URL аватара группы',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}

export class AddParticipantsDto {
  @ApiProperty({
    example: [5, 6, 7],
    description: 'Список ID пользователей для добавления в группу',
    required: true,
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  userIds: number[];
}

export class SendMessageDto {
  @ApiProperty({
    example: 'Привет! Как дела?',
    description: 'Текст сообщения',
    required: true,
  })
  @IsString()
  @MinLength(1)
  content: string;
}

export class GetMessagesDto {
  @ApiProperty({
    example: 1,
    description: 'ID последнего сообщения для пагинации',
    required: false,
  })
  @IsInt()
  @IsOptional()
  cursor?: number;

  @ApiProperty({
    example: 50,
    description: 'Количество сообщений на странице',
    required: false,
  })
  @IsInt()
  @IsOptional()
  limit?: number;
}
