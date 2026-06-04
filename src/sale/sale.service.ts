import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { CreateSaleDto, UpdateSaleDto } from './sale.dto';

@Injectable()
export class SaleService {
  constructor(private db: DbService) {}

  async create(createSaleDto: CreateSaleDto) {
    // Проверяем существование клиента, если указан
    if (createSaleDto.clientId) {
      const client = await this.db.client.findUnique({
        where: { id: createSaleDto.clientId },
      });
      if (!client) {
        throw new NotFoundException(
          `Client with ID ${createSaleDto.clientId} not found`,
        );
      }
    }

    return this.db.sale.create({
      data: {
        title: createSaleDto.title,
        description: createSaleDto.description,
        amount: createSaleDto.amount,
        clientId: createSaleDto.clientId,
        managerId: createSaleDto.managerId,
        comments: createSaleDto.comments || [],
      },
      include: {
        client: true,
        manager: {
          select: {
            id: true,
            email: true,
            // Добавьте другие поля пользователя по необходимости
          },
        },
      },
    });
  }

  async findAll() {
    return this.db.sale.findMany({
      include: {
        client: true,
        manager: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const sale = await this.db.sale.findUnique({
      where: { id },
      include: {
        client: true,
        manager: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    await this.findOne(id); // Проверяем существование

    // Если обновляется clientId, проверяем существование нового клиента
    if (updateSaleDto.clientId) {
      const client = await this.db.client.findUnique({
        where: { id: updateSaleDto.clientId },
      });
      if (!client) {
        throw new NotFoundException(
          `Client with ID ${updateSaleDto.clientId} not found`,
        );
      }
    }

    return this.db.sale.update({
      where: { id },
      data: {
        title: updateSaleDto.title,
        description: updateSaleDto.description,
        amount: updateSaleDto.amount,
        clientId: updateSaleDto.clientId,
        managerId: updateSaleDto.managerId,
        comments: updateSaleDto.comments,
        closedAt: updateSaleDto.closedAt,
      },
      include: {
        client: true,
        manager: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Проверяем существование
    return this.db.sale.delete({
      where: { id },
    });
  }

  async findByClient(clientId: number) {
    const client = await this.db.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    return this.db.sale.findMany({
      where: { clientId },
      include: {
        manager: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByManager(managerId: number) {
    return this.db.sale.findMany({
      where: { managerId },
      include: {
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async addComment(id: number, comment: string) {
    const sale = await this.findOne(id);

    const updatedComments = [...sale.comments, comment];

    return this.db.sale.update({
      where: { id },
      data: {
        comments: updatedComments,
      },
      include: {
        client: true,
        manager: true,
      },
    });
  }
}
