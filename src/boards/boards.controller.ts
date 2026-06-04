import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import {
  AddMemberDto,
  UpdateBoardDto,
  CreateBoardDto,
  UpdateMemberRoleDto,
} from './boards.dto';

import {
  DocsGetAllBoards,
  DocsGetBoardById,
  DocsCreateBoard,
  DocsUpdateBoard,
  DocsDeleteBoard,
  DocsAddMember,
  DocsUpdateMemberRole,
  DocsRemoveMember,
} from './boards.docs';
import { Permission } from 'src/generated/prisma/enums';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('boards')
@UseGuards(AuthGuard, PermissionGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsGetAllBoards()
  async findAll(@Req() req: any) {
    return this.boardsService.findAll(req.user.sub);
  }

  @Get(':id')
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsGetBoardById()
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.boardsService.findOne(id, req.user.sub);
  }

  @Post()
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsCreateBoard()
  async create(@Body() dto: CreateBoardDto, @Req() req: any) {
    return this.boardsService.create(req.user.sub, dto);
  }

  @Put(':id')
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsUpdateBoard()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBoardDto,
    @Req() req: any,
  ) {
    return this.boardsService.update(id, req.user.sub, dto);
  }

  @Delete(':id')
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsDeleteBoard()
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.boardsService.remove(id, req.user.sub);
  }

  // ========== УЧАСТНИКИ ==========

  @Post(':id/members')
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsAddMember()
  async addMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddMemberDto,
    @Req() req: any,
  ) {
    return this.boardsService.addMember(id, req.user.sub, dto);
  }

  @Put(':id/members/:memberId')
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsUpdateMemberRole()
  async updateMemberRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateMemberRoleDto,
    @Req() req: any,
  ) {
    return this.boardsService.updateMemberRole(id, memberId, req.user.sub, dto);
  }

  @Delete(':id/members/:memberId')
  @RequirePermission(Permission.ACCESS_TASKS)
  @DocsRemoveMember()
  async removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Req() req: any,
  ) {
    return this.boardsService.removeMember(id, memberId, req.user.sub);
  }
}
