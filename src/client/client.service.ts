import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { ClientPriority, ClientStatus } from 'src/generated/prisma/enums';
import { CreateClientDto, UpdateClientDto } from './client.dto';

@Injectable()
export class ClientService {
  constructor(private db: DbService) {}

  async create(data: CreateClientDto) {
    return this.db.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        position: data.position,
        address: data.address,
        city: data.city,
        country: data.country || 'Россия',
        status: data.status || ClientStatus.NEW,
        priority: data.priority || ClientPriority.MEDIUM,
      },
    });
  }

  async findOne(id: number) {
    const sale = await this.db.client.findUnique({
      where: { id },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async findAll() {
    return this.db.client.findMany({
      include: {
        sales: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: number, data: UpdateClientDto) {
    await this.findOne(id); // Проверяем существование

    return this.db.client.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        position: data.position,
        address: data.address,
        city: data.city,
        country: data.country,
        status: data.status,
        priority: data.priority,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Проверяем существование

    // Сначала обновляем связанные продажи (устанавливаем clientId = null)
    await this.db.sale.updateMany({
      where: { clientId: id },
      data: { clientId: null },
    });

    // Затем удаляем клиента
    return this.db.client.delete({
      where: { id },
    });
  }
}
