import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { DbService } from 'src/db/db.service';
import { MessageService } from 'src/message/message.service';

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, MessageService, DbService],
  exports: [ChatService, MessageService],
})
export class ChatModule {}
