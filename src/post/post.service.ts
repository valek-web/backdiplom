// post.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  UpdateCommentDto,
} from './post.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class PostService {
  constructor(private db: DbService) {}

  async create(authorId: number, dto: CreatePostDto) {
    const [image, video] = await Promise.all([
      dto.imageId
        ? this.db.image.findUnique({
            where: { id: dto.imageId },
          })
        : Promise.resolve(null),
      dto.videoId
        ? this.db.video.findUnique({
            where: { id: dto.videoId },
          })
        : Promise.resolve(null),
    ]);

    if (dto.imageId && !image) {
      throw new NotFoundException(`Image with id ${dto.imageId} not found`);
    }

    if (dto.videoId && !video) {
      throw new NotFoundException(`Video with id ${dto.videoId} not found`);
    }

    const post = await this.db.post.create({
      data: {
        content: dto.content,
        authorId: authorId,
        imageId: image ? dto.imageId : null,
        videoId: video ? dto.videoId : null,
        publishedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        images: true,
        videos: true,
      },
    });

    return post;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.db.post.findMany({
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          images: true,
          videos: true,
          likes: true,
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      }),
      this.db.post.count(),
    ]);

    // Подсчитываем количество комментариев для каждого поста
    const postsWithCommentCount = posts.map((post) => ({
      ...post,
      commentsCount: post.comments.length,
    }));

    return { posts: postsWithCommentCount, total };
  }

  async update(
    id: number,
    userId: number,
    isSystemAdmin: boolean,
    dto: UpdatePostDto,
  ) {
    const post = await this.db.post.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Пост не найден');
    }

    if (!isSystemAdmin && post.authorId !== userId) {
      throw new ForbiddenException('Нет прав на редактирование этого поста');
    }

    if (dto.imageId) {
      const image = await this.db.image.findUnique({
        where: { id: dto.imageId },
      });
      if (!image) {
        throw new BadRequestException('Изображение не найдено');
      }
    }

    if (dto.videoId) {
      const video = await this.db.video.findUnique({
        where: { id: dto.videoId },
      });
      if (!video) {
        throw new BadRequestException('Видео не найдено');
      }
    }

    const updatedPost = await this.db.post.update({
      where: { id },
      data: {
        content: dto.content,
        imageId: dto.imageId,
        videoId: dto.videoId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        images: true,
        videos: true,
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return updatedPost;
  }

  async remove(
    id: number,
    userId: number,
    isSystemAdmin: boolean,
  ): Promise<{ message: string }> {
    const post = await this.db.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Пост не найден');
    }

    if (!isSystemAdmin && post.authorId !== userId) {
      throw new ForbiddenException('Нет прав на удаление этого поста');
    }

    await this.db.post.delete({
      where: { id },
    });

    return { message: 'Пост успешно удален' };
  }

  // ========== ЛАЙКИ ==========

  async like(
    postId: number,
    userId: number,
  ): Promise<{ liked: boolean; likesCount: number }> {
    const post = await this.db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Пост не найден');
    }

    try {
      await this.db.postLike.create({
        data: {
          postId,
          userId,
        },
      });

      const likesCount = await this.db.postLike.count({
        where: { postId },
      });

      return { liked: true, likesCount };
    } catch (error) {
      throw new BadRequestException('Вы уже поставили лайк этому посту');
    }
  }

  async unlike(
    postId: number,
    userId: number,
  ): Promise<{ liked: boolean; likesCount: number }> {
    const post = await this.db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Пост не найден');
    }

    const like = await this.db.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!like) {
      throw new BadRequestException('Вы не ставили лайк этому посту');
    }

    await this.db.postLike.delete({
      where: {
        id: like.id,
      },
    });

    const likesCount = await this.db.postLike.count({
      where: { postId },
    });

    return { liked: false, likesCount };
  }

  // ========== КОММЕНТАРИИ ==========

  async addComment(postId: number, userId: number, dto: CreateCommentDto) {
    // Проверяем существование поста
    const post = await this.db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Пост не найден');
    }

    // Создаем комментарий
    const comment = await this.db.postComments.create({
      data: {
        content: dto.content,
        postId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return comment;
  }

  async getComments(postId: number, page: number = 1, limit: number = 20) {
    // Проверяем существование поста
    const post = await this.db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Пост не найден');
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.db.postComments.findMany({
        where: { postId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.db.postComments.count({
        where: { postId },
      }),
    ]);

    return {
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateComment(
    commentId: number,
    userId: number,
    isSystemAdmin: boolean,
    dto: UpdateCommentDto,
  ) {
    // Находим комментарий
    const comment = await this.db.postComments.findUnique({
      where: { id: commentId },
      include: {
        post: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    // Проверяем права: админ или автор комментария
    if (!isSystemAdmin && comment.userId !== userId) {
      throw new ForbiddenException(
        'Нет прав на редактирование этого комментария',
      );
    }

    // Обновляем комментарий
    const updatedComment = await this.db.postComments.update({
      where: { id: commentId },
      data: {
        content: dto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedComment;
  }

  async deleteComment(
    commentId: number,
    userId: number,
    isSystemAdmin: boolean,
  ): Promise<{ message: string }> {
    // Находим комментарий
    const comment = await this.db.postComments.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    // Проверяем права: админ или автор комментария
    if (!isSystemAdmin && comment.userId !== userId) {
      throw new ForbiddenException('Нет прав на удаление этого комментария');
    }

    // Удаляем комментарий
    await this.db.postComments.delete({
      where: { id: commentId },
    });

    return { message: 'Комментарий успешно удален' };
  }
}
