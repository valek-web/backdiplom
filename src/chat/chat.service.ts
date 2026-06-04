// src/chat/chat.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { ChatParticipantRole, ChatType } from 'src/generated/prisma/enums';

@Injectable()
export class ChatService {
  constructor(private db: DbService) {}

  // Создание или получение личного чата
  async getOrCreatePrivateChat(userId: number, otherUserId: number) {
    // Проверяем, что оба ID валидны и являются числами
    if (!userId || !otherUserId || isNaN(userId) || isNaN(otherUserId)) {
      throw new BadRequestException('Invalid user IDs provided');
    }

    // Преобразуем в числа на всякий случай
    const currentUserId = Number(userId);
    const targetUserId = Number(otherUserId);

    if (currentUserId === targetUserId) {
      throw new BadRequestException('Cannot create chat with yourself');
    }

    // Сначала проверяем, существует ли уже чат
    const existingChat = await this.db.chat.findFirst({
      where: {
        type: ChatType.PRIVATE,
        participants: {
          every: {
            userId: { in: [currentUserId, targetUserId] },
          },
        },
      },
      include: {
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const newChat = await this.db.chat.create({
      data: {
        type: ChatType.PRIVATE,
        participants: {
          create: [
            { userId: currentUserId, role: ChatParticipantRole.MEMBER },
            { userId: targetUserId, role: ChatParticipantRole.MEMBER },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return newChat;
  }

  // Создание группового чата
  async createGroupChat(
    userId: number,
    data: {
      name: string;
      description?: string;
      avatar?: string;
      participantIds: number[];
    },
  ) {
    const uniqueParticipants = [...new Set([userId, ...data.participantIds])];

    return this.db.chat.create({
      data: {
        type: ChatType.GROUP,
        name: data.name,
        description: data.description,
        avatar: data.avatar,
        participants: {
          create: [
            { userId, role: ChatParticipantRole.OWNER },
            ...uniqueParticipants
              .filter((id) => id !== userId)
              .map((id) => ({ userId: id, role: ChatParticipantRole.MEMBER })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // Получение всех чатов пользователя
  async getUserChats(userId: number) {
    const chats = await this.db.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
            isActive: true,
          },
        },
      },
      include: {
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Добавляем информацию о непрочитанных
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const participant = chat.participants.find((p) => p.userId === userId);

        const unreadCount = await this.db.message.count({
          where: {
            chatId: chat.id,
            createdAt: { gt: participant?.lastReadAt || new Date(0) },
            userId: { not: userId },
          },
        });

        // Для личных чатов добавляем имя и аватар собеседника
        let displayName = chat.name;
        let displayAvatar = chat.avatar;

        if (chat.type === ChatType.PRIVATE) {
          const otherUser = chat.participants.find(
            (p) => p.userId !== userId,
          )?.user;
          if (otherUser) {
            displayName = otherUser.name;
            displayAvatar = null;
          }
        }

        return {
          ...chat,
          displayName,
          displayAvatar,
          unreadCount,
          lastMessage: chat.messages[0],
          participantRole: participant?.role,
        };
      }),
    );

    return chatsWithUnread;
  }

  // Получение чата с участниками
  async getChatById(chatId: string, userId: number) {
    const chat = await this.db.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            userId,
            isActive: true,
          },
        },
      },
      include: {
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    return chat;
  }

  // Добавление участников в групповой чат
  async addParticipants(chatId: string, userId: number, newUserIds: number[]) {
    const chat = await this.getChatById(chatId, userId);

    if (chat.type !== ChatType.GROUP) {
      throw new ForbiddenException('Только групповые чаты');
    }

    const participant = chat.participants.find((p) => p.userId === userId);
    if (participant?.role === ChatParticipantRole.MEMBER) {
      throw new ForbiddenException('Недостаточно прав');
    }

    // Добавляем новых участников
    await this.db.chatParticipant.createMany({
      data: newUserIds.map((newUserId) => ({
        chatId,
        userId: newUserId,
        role: ChatParticipantRole.MEMBER,
      })),
      skipDuplicates: true,
    });

    return this.getChatById(chatId, userId);
  }

  // Удаление участника из чата
  async removeParticipant(
    chatId: string,
    userId: number,
    targetUserId: number,
  ) {
    const chat = await this.getChatById(chatId, userId);

    if (chat.type !== ChatType.GROUP) {
      throw new ForbiddenException('Только групповые чаты');
    }

    const currentUser = chat.participants.find((p) => p.userId === userId);
    const targetUser = chat.participants.find((p) => p.userId === targetUserId);

    if (!targetUser) {
      throw new NotFoundException('Участник не найден');
    }

    if (currentUser?.role === ChatParticipantRole.MEMBER) {
      throw new ForbiddenException('Недостаточно прав');
    }

    if (
      currentUser?.role === ChatParticipantRole.ADMIN &&
      targetUser?.role !== ChatParticipantRole.MEMBER
    ) {
      throw new ForbiddenException(
        'Нельзя удалить администратора или владельца',
      );
    }

    // Если удаляем владельца, передаем права другому админу
    if (targetUser?.role === ChatParticipantRole.OWNER) {
      const newOwner = chat.participants.find(
        (p) => p.role === ChatParticipantRole.ADMIN,
      );
      if (newOwner) {
        await this.db.chatParticipant.update({
          where: { id: newOwner.id },
          data: { role: ChatParticipantRole.OWNER },
        });
      } else {
        const anyOther = chat.participants.find(
          (p) => p.userId !== targetUserId,
        );
        if (anyOther) {
          await this.db.chatParticipant.update({
            where: { id: anyOther.id },
            data: { role: ChatParticipantRole.OWNER },
          });
        }
      }
    }

    await this.db.chatParticipant.update({
      where: { id: targetUser.id },
      data: { isActive: false },
    });

    return { success: true };
  }

  // Выход из чата
  async leaveChat(chatId: string, userId: number) {
    const chat = await this.getChatById(chatId, userId);

    const participant = chat.participants.find((p) => p.userId === userId);
    if (!participant) {
      throw new NotFoundException('Участник не найден');
    }

    // Если владелец выходит, передаем права
    if (participant.role === ChatParticipantRole.OWNER) {
      const newOwner = chat.participants.find(
        (p) => p.role === ChatParticipantRole.ADMIN,
      );
      if (newOwner) {
        await this.db.chatParticipant.update({
          where: { id: newOwner.id },
          data: { role: ChatParticipantRole.OWNER },
        });
      } else {
        const anyOther = chat.participants.find((p) => p.userId !== userId);
        if (anyOther) {
          await this.db.chatParticipant.update({
            where: { id: anyOther.id },
            data: { role: ChatParticipantRole.OWNER },
          });
        }
      }
    }

    await this.db.chatParticipant.update({
      where: { id: participant.id },
      data: { isActive: false },
    });

    return { success: true };
  }

  // Обновление информации о групповом чате
  async updateChat(
    chatId: string,
    userId: number,
    data: {
      name?: string;
      description?: string;
      avatar?: string;
    },
  ) {
    const chat = await this.getChatById(chatId, userId);

    if (chat.type !== ChatType.GROUP) {
      throw new ForbiddenException('Только групповые чаты');
    }

    const participant = chat.participants.find((p) => p.userId === userId);
    if (participant?.role === ChatParticipantRole.MEMBER) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return this.db.chat.update({
      where: { id: chatId },
      data,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }
}
