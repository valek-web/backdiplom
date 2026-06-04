import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateBoardDto,
  UpdateBoardDto,
  AddMemberDto,
  UpdateMemberRoleDto,
} from './boards.dto';
import { DbService } from 'src/db/db.service';
import { Role } from 'src/generated/prisma/enums';

@Injectable()
export class BoardsService {
  constructor(private db: DbService) {}

  async create(authorId: number, dto: CreateBoardDto) {
    return this.db.$transaction(async (prisma) => {
      // Создаем доску
      const board = await prisma.board.create({
        data: {
          title: dto.title,
          description: dto.description,
          authorId: authorId,
        },
      });

      // Добавляем автора как участника с ролью OWNER
      await prisma.boardMember.create({
        data: {
          boardId: board.id,
          userId: authorId,
          role: 'OWNER',
        },
      });

      // Создаем стандартные колонки
      const defaultColumns = ['В очереди', 'В работе', 'На ревью', 'Готово'];
      await Promise.all(
        defaultColumns.map((title, index) =>
          prisma.column.create({
            data: {
              title,
              order: index,
              boardId: board.id,
            },
          }),
        ),
      );

      return board;
    });
  }

  async findAll(userId: number) {
    const boards = await this.db.board.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        columns: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return boards;
  }

  async findOne(id: number, userId: number) {
    const board = await this.db.board.findFirst({
      where: {
        id,
        members: {
          some: { userId },
        },
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                author: { select: { id: true, name: true } },
                assignee: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Доска не найдена или у вас нет доступа');
    }

    return board;
  }

  async update(id: number, userId: number, dto: UpdateBoardDto) {
    await this.checkAccess(id, userId, ['OWNER', 'EDITOR']);

    return this.db.board.update({
      where: { id },
      data: dto,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        columns: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.checkAccess(id, userId, ['OWNER']);

    await this.db.board.delete({
      where: { id },
    });

    return { message: 'Доска успешно удалена' };
  }

  // ========== УЧАСТНИКИ ==========

  async addMember(boardId: number, userId: number, dto: AddMemberDto) {
    await this.checkAccess(boardId, userId, ['OWNER']);

    // Проверяем существование доски
    const board = await this.db.board.findUnique({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException('Доска не найдена');
    }

    // Проверяем существование пользователя
    const user = await this.db.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем, не является ли пользователь уже участником
    const existingMember = await this.db.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: dto.userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('Пользователь уже является участником доски');
    }

    return this.db.boardMember.create({
      data: {
        boardId,
        userId: dto.userId,
        role: dto.role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async updateMemberRole(
    boardId: number,
    memberId: number,
    userId: number,
    dto: UpdateMemberRoleDto,
  ) {
    await this.checkAccess(boardId, userId, ['OWNER']);

    const member = await this.db.boardMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Участник не найден');
    }

    if (member.boardId !== boardId) {
      throw new NotFoundException('Участник не принадлежит этой доске');
    }

    return this.db.boardMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async removeMember(boardId: number, memberId: number, userId: number) {
    await this.checkAccess(boardId, userId, ['OWNER']);

    const member = await this.db.boardMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Участник не найден');
    }

    if (member.boardId !== boardId) {
      throw new NotFoundException('Участник не принадлежит этой доске');
    }

    // Нельзя удалить владельца
    if (member.role === 'OWNER') {
      throw new ForbiddenException('Нельзя удалить владельца доски');
    }

    await this.db.boardMember.delete({
      where: { id: memberId },
    });

    return { message: 'Участник успешно удален' };
  }

  // ========== HELPER ==========

  private async checkAccess(
    boardId: number,
    userId: number,
    allowedRoles: Role[],
  ) {
    const member = await this.db.boardMember.findFirst({
      where: {
        boardId,
        userId,
        role: { in: allowedRoles },
      },
    });

    if (!member) {
      throw new ForbiddenException('Нет прав для выполнения этого действия');
    }

    return member;
  }
}
