import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminController } from './admin.controller';
import { MailService } from '../mail/mail.service';
import { AllowedEmailsService } from './allowed-emails.service';
import { SystemAdminService } from './system-admin.service';
import { CodeGenerator } from '../common/utils/code-generator.util';
import { AuthGuard } from './../common/guards/jwt-auth.guard';
import { AdminGuard } from './../common/guards/admin.guard';
import { DbModule } from 'src/db/db.module';
import { RedisCodesService } from 'src/redis/redis-codes.service';

@Module({
  imports: [
    DbModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES || '900'),
      },
    }),
  ],
  controllers: [AuthController, AdminController],
  providers: [
    // Сервисы
    AuthService,
    MailService,
    AllowedEmailsService,
    SystemAdminService,
    CodeGenerator,
    RedisCodesService,
    // Guards (поставщики для глобального использования)
    AuthGuard,
    AdminGuard,
  ],
  exports: [AuthService, AuthGuard, AdminGuard, JwtModule],
})
export class AuthModule {}
