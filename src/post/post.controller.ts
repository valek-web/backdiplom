// post.controller.ts
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
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  UpdateCommentDto,
} from './post.dto';
import { Permission } from 'src/generated/prisma/enums';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import {
  DocsCreatePost,
  DocsDeletePost,
  DocsGetAllPosts,
  DocsLikePost,
  DocsUnlikePost,
  DocsUpdatePost,
  DocsAddComment,
  DocsGetComments,
  DocsUpdateComment,
  DocsDeleteComment,
} from './post.docs';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';

@Controller('posts')
@UseGuards(AuthGuard, PermissionGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @RequirePermission(Permission.READ_POST)
  @DocsGetAllPosts()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.postService.findAll(page, limit);
  }

  @Post()
  @RequirePermission(Permission.WRITE_POST)
  @DocsCreatePost()
  async create(@Body() dto: CreatePostDto, @Req() req: any) {
    console.log(req.user);
    return this.postService.create(req.user.sub, dto);
  }

  @Put(':id')
  @RequirePermission(Permission.WRITE_POST)
  @DocsUpdatePost()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @Req() req: any,
  ) {
    return this.postService.update(
      id,
      req.user.sub,
      req.user.isSystemAdmin,
      dto,
    );
  }

  @Delete(':id')
  @RequirePermission(Permission.WRITE_POST)
  @DocsDeletePost()
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.postService.remove(id, req.user.sub, req.user.isSystemAdmin);
  }

  @Post(':id/like')
  @RequirePermission(Permission.READ_POST)
  @DocsLikePost()
  async like(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.postService.like(id, req.user.sub);
  }

  @Delete(':id/like')
  @RequirePermission(Permission.READ_POST)
  @DocsUnlikePost()
  async unlike(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.postService.unlike(id, req.user.sub);
  }

  // ========== КОММЕНТАРИИ ==========

  @Post(':id/comments')
  @RequirePermission(Permission.READ_POST)
  @DocsAddComment()
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.postService.addComment(id, req.user.sub, dto);
  }

  @Get(':id/comments')
  @RequirePermission(Permission.READ_POST)
  @DocsGetComments()
  async getComments(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.postService.getComments(id, page, limit);
  }

  @Put('comments/:commentId')
  @RequirePermission(Permission.WRITE_POST)
  @DocsUpdateComment()
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
    @Req() req: any,
  ) {
    return this.postService.updateComment(
      commentId,
      req.user.sub,
      req.user.isSystemAdmin,
      dto,
    );
  }

  @Delete('comments/:commentId')
  @RequirePermission(Permission.WRITE_POST)
  @DocsDeleteComment()
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: any,
  ) {
    return this.postService.deleteComment(
      commentId,
      req.user.sub,
      req.user.isSystemAdmin,
    );
  }
}
