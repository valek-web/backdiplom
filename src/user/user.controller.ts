import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { DocsGetAllUser, DocsGetUserById, DocsUpdateUser } from './user.docs';
import { UserUpdateDto } from './user.dto';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @DocsGetUserById()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Get('')
  @DocsGetAllUser()
  findMany() {
    return this.userService.findMany();
  }

  @Put(':id')
  @DocsUpdateUser()
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UserUpdateDto) {
    return this.userService.update(id, data);
  }
}
