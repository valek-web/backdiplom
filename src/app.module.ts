import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { RedisModule } from './redis/redis.module';
import { ImageController } from './image/image.controller';
import { ImageModule } from './image/image.module';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { VideoModule } from './video/video.module';
import { PostModule } from './post/post.module';
import { BoardsService } from './boards/boards.service';
import { BoardsModule } from './boards/boards.module';
import { ColumnsModule } from './columns/columns.module';
import { TasksModule } from './tasks/tasks.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { ClientModule } from './client/client.module';
import { SaleModule } from './sale/sale.module';

@Module({
  imports: [
    DbModule,
    AuthModule,
    RedisModule,
    ImageModule,
    UserModule,
    VideoModule,
    ConfigModule.forRoot({
      isGlobal: true, // Делает ConfigModule глобальным
      envFilePath: '.env', // Указывает путь к .env файлу
    }),
    PostModule,
    BoardsModule,
    ColumnsModule,
    TasksModule,
    ChatModule,
    MessageModule,
    ClientModule,
    SaleModule,
  ],
  controllers: [AuthController, ImageController, UserController],
  providers: [BoardsService],
  exports: [],
})
export class AppModule {}
