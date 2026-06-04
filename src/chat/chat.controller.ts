// src/chat/chat.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  CreateGroupChatDto,
  UpdateChatDto,
  AddParticipantsDto,
} from './chat.dto';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  DocsGetUserChats,
  DocsCreatePrivateChat,
  DocsCreateGroupChat,
  DocsGetChatById,
  DocsUpdateChat,
  DocsAddParticipants,
  DocsRemoveParticipant,
  DocsLeaveChat,
  DocsGetMessages,
  DocsDeleteMessage,
} from './chat.docs';
import { MessageService } from 'src/message/message.service';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { Permission } from 'src/generated/prisma/enums';

@Controller('chats')
@UseGuards(AuthGuard, PermissionGuard)
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private chatService: ChatService,
    private messagesService: MessageService,
  ) {}

  // Вспомогательный метод для получения ID пользователя
  private getUserId(req: any): number {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    return Number(userId);
  }

  @Get()
  @RequirePermission(Permission.ACCESS_CHAT)
  @DocsGetUserChats()
  async getUserChats(@Req() req: any) {
    this.logger.log(`getUserChats called, user: ${JSON.stringify(req.user)}`);
    const userId = this.getUserId(req);
    return this.chatService.getUserChats(userId);
  }

  @Post('private/:userId')
  @RequirePermission(Permission.ACCESS_CHAT)
  @DocsCreatePrivateChat()
  async createPrivateChat(
    @Param('userId', ParseIntPipe) otherUserId: number,
    @Req() req: any,
  ) {
    this.logger.log(
      `createPrivateChat called, otherUserId: ${otherUserId}, user: ${JSON.stringify(req.user)}`,
    );

    const currentUserId = this.getUserId(req);

    // Нельзя создать чат с самим собой
    if (currentUserId === otherUserId) {
      throw new BadRequestException('Cannot create chat with yourself');
    }

    return this.chatService.getOrCreatePrivateChat(currentUserId, otherUserId);
  }

  @Post('group')
  @RequirePermission(Permission.ACCESS_CHAT)
  @DocsCreateGroupChat()
  async createGroupChat(@Body() dto: CreateGroupChatDto, @Req() req: any) {
    this.logger.log(
      `createGroupChat called, user: ${JSON.stringify(req.user)}`,
    );
    const userId = this.getUserId(req);
    return this.chatService.createGroupChat(userId, dto);
  }

  @Get(':id')
  @RequirePermission(Permission.ACCESS_CHAT)
  @DocsGetChatById()
  async getChatById(@Param('id') id: string, @Req() req: any) {
    const userId = this.getUserId(req);
    return this.chatService.getChatById(id, userId);
  }

  @Put(':id')
  @RequirePermission(Permission.ACCESS_CHAT)
  @DocsUpdateChat()
  async updateChat(
    @Param('id') id: string,
    @Body() dto: UpdateChatDto,
    @Req() req: any,
  ) {
    const userId = this.getUserId(req);
    return this.chatService.updateChat(id, userId, dto);
  }

  @Post(':id/participants')
  @RequirePermission(Permission.ACCESS_CHAT)
  @DocsAddParticipants()
  async addParticipants(
    @Param('id') id: string,
    @Body() dto: AddParticipantsDto,
    @Req() req: any,
  ) {
    const userId = this.getUserId(req);
    return this.chatService.addParticipants(id, userId, dto.userIds);
  }

  @Delete(':id/participants/:userId')
  @RequirePermission(Permission.ACCESS_CHAT)
  @DocsRemoveParticipant()
  async removeParticipant(
    @Param('id') id: string,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Req() req: any,
  ) {
    const userId = this.getUserId(req);
    return this.chatService.removeParticipant(id, userId, targetUserId);
  }

  @Post(':id/leave')
  @RequirePermission(Permission.ACCESS_CHAT)
  @DocsLeaveChat()
  async leaveChat(@Param('id') id: string, @Req() req: any) {
    const userId = this.getUserId(req);
    return this.chatService.leaveChat(id, userId);
  }

  @Get(':id/messages')
  @RequirePermission(Permission.ACCESS_CHAT)
  @DocsGetMessages()
  async getMessages(
    @Param('id') id: string,
    @Query('cursor', new DefaultValuePipe(0), ParseIntPipe) cursor: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Req() req: any,
  ) {
    const userId = this.getUserId(req);
    return this.messagesService.getMessages(id, userId, cursor, limit);
  }

  @Delete('messages/:id')
  @RequirePermission(Permission.ACCESS_CHAT)
  @DocsDeleteMessage()
  async deleteMessage(
    @Param('id', ParseIntPipe) messageId: number,
    @Req() req: any,
  ) {
    const userId = this.getUserId(req);
    return this.messagesService.deleteMessage(messageId, userId);
  }
}
