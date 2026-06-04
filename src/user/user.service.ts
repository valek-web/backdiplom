import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UserUpdateDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private readonly db: DbService) {}

  async findOne(id: number) {
    const user = await this.db.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findMany() {
    const users = await this.db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!users || users.length === 0) {
      throw new Error('Users not found');
    }

    return users;
  }

  async update(id: number, data: UserUpdateDto) {
    const user = await this.db.user.update({
      where: { id },
      data,
    });

    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
