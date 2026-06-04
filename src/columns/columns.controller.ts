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
import { ColumnsService } from './columns.service';
import {
  CreateColumnDto,
  UpdateColumnDto,
  ReorderColumnsDto,
} from './columns.dto';
import {
  DocsGetColumnsByBoard,
  DocsGetColumnById,
  DocsCreateColumn,
  DocsUpdateColumn,
  DocsDeleteColumn,
  DocsReorderColumns,
} from './columns.docs';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { Permission } from 'src/generated/prisma/enums';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('columns')
@UseGuards(AuthGuard, PermissionGuard)
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Get('board/:boardId')
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsGetColumnsByBoard()
  async getColumnsByBoard(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Req() req: any,
  ) {
    return this.columnsService.getColumnsByBoard(boardId, req.user.sub);
  }

  @Get(':id')
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsGetColumnById()
  async getColumnById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.columnsService.getColumnById(id, req.user.sub);
  }

  @Post()
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsCreateColumn()
  async create(
    @Query('boardId', ParseIntPipe) boardId: number,
    @Body() dto: CreateColumnDto,
    @Req() req: any,
  ) {
    return this.columnsService.create(boardId, req.user.sub, dto);
  }

  @Put(':id')
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsUpdateColumn()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateColumnDto,
    @Req() req: any,
  ) {
    return this.columnsService.update(id, req.user.sub, dto);
  }

  @Delete(':id')
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsDeleteColumn()
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.columnsService.delete(id, req.user.sub);
  }

  @Post('reorder')
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsReorderColumns()
  async reorder(
    @Query('boardId', ParseIntPipe) boardId: number,
    @Body() dto: ReorderColumnsDto,
    @Req() req: any,
  ) {
    return this.columnsService.reorder(boardId, req.user.sub, dto);
  }
}
