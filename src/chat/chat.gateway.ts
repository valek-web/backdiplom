import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private userSockets = new Map<number, string[]>();

  constructor(
    private chatService: ChatService,
    private messagesService: MessageService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket чат сервер инициализирован');
  }

  async handleConnection(client: Socket) {
    try {
      const userId = client.handshake.auth.userId;

      if (!userId) {
        client.disconnect();
        return;
      }

      client.data.userId = userId;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }

      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.push(client.id);
      }

      const userChats = await this.chatService.getUserChats(userId);
      for (const chat of userChats) {
        client.join(`chat:${chat.id}`);
      }

      this.logger.log(`Пользователь ${userId} подключен`);
      client.emit('connected', { status: 'ok', userId });
    } catch (error) {
      this.logger.error(`Ошибка подключения: ${error}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        const index = sockets.indexOf(client.id);
        if (index > -1) sockets.splice(index, 1);

        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
      }

      this.logger.log(`Пользователь ${userId} отключился`);
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody()
    data: {
      chatId: string;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      const message = await this.messagesService.sendMessage({
        ...data,
        userId,
      });

      if (this.server) {
        this.server.to(`chat:${data.chatId}`).emit('new-message', message);
        this.server.to(`chat:${data.chatId}`).emit('chat-updated', {
          chatId: data.chatId,
          lastMessage: message,
        });
      }
    } catch (error) {
      client.emit('error', { message: error });
    }
  }

  @SubscribeMessage('get-messages')
  async handleGetMessages(
    @MessageBody() data: { chatId: string; cursor?: number; limit?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      const messages = await this.messagesService.getMessages(
        data.chatId,
        userId,
        data.cursor,
        data.limit || 50,
      );
      client.emit('messages-history', { chatId: data.chatId, messages });
    } catch (error) {
      client.emit('error', { message: error });
    }
  }

  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.messagesService.markChatAsRead(data.chatId, userId);

    if (this.server) {
      this.server.to(`chat:${data.chatId}`).emit('chat-read', {
        chatId: data.chatId,
        userId,
      });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { chatId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    client.to(`chat:${data.chatId}`).emit('user-typing', {
      userId,
      chatId: data.chatId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const chat = await this.chatService.getChatById(data.chatId, userId);
    if (chat) {
      client.join(`chat:${data.chatId}`);
      client.emit('joined-chat', { chatId: data.chatId });
    }
  }

  @SubscribeMessage('leave-chat')
  handleLeaveChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`chat:${data.chatId}`);
    client.emit('left-chat', { chatId: data.chatId });
  }
}
