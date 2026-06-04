import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class MessageService {
  constructor(private db: DbService) {}

  async sendMessage(data: { chatId: string; userId: number; content: string }) {
    const participant = await this.db.chatParticipant.findFirst({
      where: {
        chatId: data.chatId,
        userId: data.userId,
        isActive: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Вы не участник этого чата');
    }

    const message = await this.db.message.create({
      data: {
        content: data.content,
        chatId: data.chatId,
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await this.db.chat.update({
      where: { id: data.chatId },
      data: { updatedAt: new Date() },
    });

    await this.db.chatParticipant.update({
      where: { id: participant.id },
      data: {
        lastReadAt: new Date(),
        unreadCount: 0,
      },
    });

    await this.db.chatParticipant.updateMany({
      where: {
        chatId: data.chatId,
        userId: { not: data.userId },
        isActive: true,
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    return message;
  }

  async getMessages(
    chatId: string,
    userId: number,
    cursor?: number,
    limit = 50,
  ) {
    const participant = await this.db.chatParticipant.findFirst({
      where: {
        chatId,
        userId,
        isActive: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Чат не найден');
    }

    const messages = await this.db.message.findMany({
      where: {
        chatId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor &&
        cursor > 0 && {
          cursor: { id: cursor },
          skip: 1,
        }),
    });

    return messages.reverse();
  }

  async markChatAsRead(chatId: string, userId: number) {
    const participant = await this.db.chatParticipant.findFirst({
      where: {
        chatId,
        userId,
        isActive: true,
      },
    });

    if (participant) {
      await this.db.chatParticipant.update({
        where: { id: participant.id },
        data: {
          lastReadAt: new Date(),
          unreadCount: 0,
        },
      });
    }
  }

  async deleteMessage(messageId: number, userId: number) {
    const message = await this.db.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (message.userId !== userId) {
      throw new ForbiddenException('Можно удалять только свои сообщения');
    }

    await this.db.message.delete({
      where: { id: messageId },
    });

    return { success: true };
  }
}
