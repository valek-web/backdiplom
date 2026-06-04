import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './tasks.dto';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { Permission } from 'src/generated/prisma/enums';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(AuthGuard, PermissionGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('column/:columnId')
  @RequirePermission(Permission.ACCESS_TASKS)
  async getTasksByColumn(
    @Param('columnId', ParseIntPipe) columnId: number,
    @Req() req: any,
  ) {
    return this.tasksService.getTasksByColumn(columnId, req.user.sub);
  }

  @Get(':id')
  @RequirePermission(Permission.ACCESS_TASKS)
  async getTaskById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.tasksService.getTaskById(id, req.user.sub);
  }

  @Post()
  @RequirePermission(Permission.ACCESS_TASKS)
  async create(
    @Query('columnId', ParseIntPipe) columnId: number,
    @Body() dto: CreateTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.create(columnId, req.user.sub, dto);
  }

  @Put(':id')
  @RequirePermission(Permission.ACCESS_TASKS)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.update(
      id,
      req.user.sub,
      req.user.isSystemAdmin,
      dto,
    );
  }

  @Delete(':id')
  @RequirePermission(Permission.ACCESS_TASKS)
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.tasksService.delete(id, req.user.sub, req.user.isSystemAdmin);
  }

  @Post(':id/move')
  @RequirePermission(Permission.ACCESS_TASKS)
  async move(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MoveTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.move(
      id,
      req.user.sub,
      req.user.isSystemAdmin,
      dto,
    );
  }
}
