import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { DbService } from 'src/db/db.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BoardsController],
  providers: [BoardsService, DbService],
  exports: [BoardsService],
})
export class BoardsModule {}
