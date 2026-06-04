import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './tasks.dto';
import { DbService } from 'src/db/db.service';
import { Role } from 'src/generated/prisma/enums';

@Injectable()
export class TasksService {
  constructor(private db: DbService) {}

  async getTasksByColumn(columnId: number, userId: number) {
    // Проверяем доступ к колонке
    await this.checkColumnAccess(columnId, userId);

    const tasks = await this.db.task.findMany({
      where: { columnId },
      include: {
        author: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        images: true,
        videos: true,
      },
      orderBy: { position: 'asc' },
    });

    return tasks;
  }

  async getTaskById(id: number, userId: number) {
    const task = await this.db.task.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        column: {
          include: {
            board: {
              include: {
                members: true,
              },
            },
          },
        },
        images: true,
        videos: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    // Проверяем доступ к доске
    const hasAccess = task.column.board.members.some(
      (member) => member.userId === userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('Нет доступа к этой задаче');
    }

    return task;
  }

  async create(columnId: number, authorId: number, dto: CreateTaskDto) {
    // Проверяем доступ к колонке
    await this.checkColumnAccess(columnId, authorId, ['OWNER', 'EDITOR']);

    // Получаем максимальную позицию
    const maxPosition = await this.db.task.aggregate({
      where: { columnId },
      _max: { position: true },
    });

    const position = (maxPosition._max.position ?? -1) + 1;

    const task = await this.db.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: dto.startDate,
        dueDate: dto.dueDate,
        authorId,
        assigneeId: dto.assigneeId,
        columnId,
        position,
        tags: dto.tags || [],
        images: dto.imageIds
          ? { connect: dto.imageIds.map((id) => ({ id })) }
          : undefined,
        videos: dto.videoIds
          ? { connect: dto.videoIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        images: true,
        videos: true,
      },
    });

    return task;
  }

  async update(
    id: number,
    userId: number,
    isSystemAdmin: boolean,
    dto: UpdateTaskDto,
  ) {
    const task = await this.db.task.findUnique({
      where: { id },
      include: {
        column: {
          include: {
            board: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    // Проверяем права
    await this.checkTaskAccess(task, userId, isSystemAdmin, [
      'OWNER',
      'EDITOR',
    ]);

    const updatedTask = await this.db.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        startDate: dto.startDate,
        dueDate: dto.dueDate,
        assigneeId: dto.assigneeId,
        tags: dto.tags,
        images: dto.imageIds
          ? { set: dto.imageIds.map((id) => ({ id })) }
          : undefined,
        videos: dto.videoIds
          ? { set: dto.videoIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        images: true,
        videos: true,
      },
    });

    return updatedTask;
  }

  async delete(id: number, userId: number, isSystemAdmin: boolean) {
    const task = await this.db.task.findUnique({
      where: { id },
      include: {
        column: {
          include: {
            board: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    // Проверяем права
    await this.checkTaskAccess(task, userId, isSystemAdmin, [
      'OWNER',
      'EDITOR',
    ]);

    await this.db.task.delete({
      where: { id },
    });

    // Переупорядочиваем оставшиеся задачи
    const remainingTasks = await this.db.task.findMany({
      where: { columnId: task.columnId },
      orderBy: { position: 'asc' },
    });

    for (let i = 0; i < remainingTasks.length; i++) {
      await this.db.task.update({
        where: { id: remainingTasks[i].id },
        data: { position: i },
      });
    }

    return { message: 'Задача успешно удалена' };
  }

  async move(
    id: number,
    userId: number,
    isSystemAdmin: boolean,
    dto: MoveTaskDto,
  ) {
    const task = await this.db.task.findUnique({
      where: { id },
      include: {
        column: {
          include: {
            board: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    // Проверяем права
    await this.checkTaskAccess(task, userId, isSystemAdmin, [
      'OWNER',
      'EDITOR',
    ]);

    // Проверяем новую колонку
    const newColumn = await this.db.column.findUnique({
      where: { id: dto.columnId },
    });
    if (!newColumn) {
      throw new NotFoundException('Колонка не найдена');
    }

    // Проверяем доступ к новой колонке
    await this.checkColumnAccess(dto.columnId, userId, ['OWNER', 'EDITOR']);

    // Получаем максимальную позицию в новой колонке
    const maxPosition = await this.db.task.aggregate({
      where: { columnId: dto.columnId },
      _max: { position: true },
    });

    const newPosition = (maxPosition._max.position ?? -1) + 1;

    // Обновляем задачу
    const updatedTask = await this.db.task.update({
      where: { id },
      data: {
        columnId: dto.columnId,
        position: newPosition,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        images: true,
        videos: true,
      },
    });

    // Переупорядочиваем старую колонку
    const oldColumnTasks = await this.db.task.findMany({
      where: { columnId: task.columnId },
      orderBy: { position: 'asc' },
    });

    for (let i = 0; i < oldColumnTasks.length; i++) {
      await this.db.task.update({
        where: { id: oldColumnTasks[i].id },
        data: { position: i },
      });
    }

    return updatedTask;
  }

  // ========== HELPER ==========

  private async checkColumnAccess(
    columnId: number,
    userId: number,
    allowedRoles: Role[] = ['OWNER', 'EDITOR', 'VIEWER'],
  ) {
    const column = await this.db.column.findUnique({
      where: { id: columnId },
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

    const hasAccess = column.board.members.some(
      (member) =>
        member.userId === userId && allowedRoles.includes(member.role),
    );

    if (!hasAccess) {
      throw new ForbiddenException('Нет доступа к этой колонке');
    }

    return column;
  }

  private async checkTaskAccess(
    task: any,
    userId: number,
    isSystemAdmin: boolean,
    allowedRoles: Role[],
  ) {
    if (isSystemAdmin) return true;

    // Автор всегда имеет доступ
    if (task.authorId === userId) return true;

    const member = task.column.board.members.find(
      (m: any) => m.userId === userId && allowedRoles.includes(m.role),
    );

    if (!member) {
      throw new ForbiddenException('Нет прав для выполнения этого действия');
    }

    return true;
  }
}
