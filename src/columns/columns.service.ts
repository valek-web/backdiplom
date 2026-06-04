import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateColumnDto,
  UpdateColumnDto,
  ReorderColumnsDto,
} from './columns.dto';
import { DbService } from 'src/db/db.service';
import { Role } from 'src/generated/prisma/enums';

@Injectable()
export class ColumnsService {
  constructor(private db: DbService) {}

  async getColumnsByBoard(boardId: number, userId: number) {
    // Проверяем доступ к доске
    await this.checkBoardAccess(boardId, userId);

    const columns = await this.db.column.findMany({
      where: { boardId },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
          include: {
            author: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return columns;
  }

  async getColumnById(id: number, userId: number) {
    const column = await this.db.column.findUnique({
      where: { id },
      include: {
        board: {
          include: {
            members: true,
          },
        },
        tasks: {
          orderBy: { position: 'asc' },
          include: {
            author: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!column) {
      throw new NotFoundException('Колонка не найдена');
    }

    // Проверяем доступ к доске
    const hasAccess = column.board.members.some(
      (member) => member.userId === userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('Нет доступа к этой колонке');
    }

    return column;
  }

  async create(boardId: number, userId: number, dto: CreateColumnDto) {
    // Проверяем доступ к доске
    await this.checkBoardAccess(boardId, userId, ['OWNER', 'EDITOR']);

    // Проверяем существование доски
    const board = await this.db.board.findUnique({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException('Доска не найдена');
    }

    // Если order не указан, ставим в конец
    let order = dto.order;
    if (order === undefined) {
      const maxOrder = await this.db.column.aggregate({
        where: { boardId },
        _max: { order: true },
      });
      order = (maxOrder._max.order ?? -1) + 1;
    }

    // Проверяем уникальность order
    const existing = await this.db.column.findFirst({
      where: { boardId, order },
    });
    if (existing) {
      throw new BadRequestException(
        `Колонка с порядком ${order} уже существует`,
      );
    }

    const column = await this.db.column.create({
      data: {
        title: dto.title,
        order,
        boardId,
      },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
        },
      },
    });

    return column;
  }

  async update(id: number, userId: number, dto: UpdateColumnDto) {
    const column = await this.db.column.findUnique({
      where: { id },
      include: {
        board: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!column) {
      throw new NotFoundException('Колонка не найдена');
    }

    // Проверяем права
    await this.checkBoardAccess(column.boardId, userId, ['OWNER', 'EDITOR']);

    // Если меняется order, проверяем уникальность
    if (dto.order !== undefined && dto.order !== column.order) {
      const existing = await this.db.column.findFirst({
        where: {
          boardId: column.boardId,
          order: dto.order,
          id: { not: id },
        },
      });
      if (existing) {
        throw new BadRequestException(
          `Колонка с порядком ${dto.order} уже существует`,
        );
      }
    }

    const updatedColumn = await this.db.column.update({
      where: { id },
      data: {
        title: dto.title,
        order: dto.order,
      },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
          include: {
            author: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
          },
        },
      },
    });

    return updatedColumn;
  }

  async delete(id: number, userId: number) {
    const column = await this.db.column.findUnique({
      where: { id },
      include: {
        board: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!column) {
      throw new NotFoundException('Колонка не найдена');
    }

    // Проверяем права (только OWNER может удалять колонки)
    await this.checkBoardAccess(column.boardId, userId, ['OWNER']);

    await this.db.column.delete({
      where: { id },
    });

    return { message: 'Колонка успешно удалена' };
  }

  async reorder(boardId: number, userId: number, dto: ReorderColumnsDto) {
    // Проверяем доступ к доске
    await this.checkBoardAccess(boardId, userId, ['OWNER', 'EDITOR']);

    // Проверяем, что все колонки принадлежат этой доске
    const columns = await this.db.column.findMany({
      where: {
        id: { in: dto.columnIds },
        boardId,
      },
    });

    if (columns.length !== dto.columnIds.length) {
      throw new BadRequestException(
        'Некоторые колонки не найдены или не принадлежат этой доске',
      );
    }

    // Обновляем порядок
    await this.db.$transaction(
      dto.columnIds.map((id, index) =>
        this.db.column.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    const updatedColumns = await this.db.column.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
        },
      },
    });

    return {
      message: 'Порядок колонок успешно обновлен',
      columns: updatedColumns,
    };
  }

  // ========== HELPER ==========

  private async checkBoardAccess(
    boardId: number,
    userId: number,
    allowedRoles: Role[] = ['OWNER', 'EDITOR', 'VIEWER'],
  ) {
    const member = await this.db.boardMember.findFirst({
      where: {
        boardId,
        userId,
        role: { in: allowedRoles },
      },
    });

    if (!member) {
      throw new ForbiddenException('Нет доступа к этой доске');
    }

    return member;
  }
}
