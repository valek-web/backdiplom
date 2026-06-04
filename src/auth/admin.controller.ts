import { AddAllowedEmailDto, UpdatePermissionsDto } from './dto/auth.dto';
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { AllowedEmailsService } from './allowed-emails.service';
import { MailService } from '../mail/mail.service';
import { AuthGuard } from './../common/guards/jwt-auth.guard';
import { AdminGuard } from './../common/guards/admin.guard';
import {
  DocsAddAllowedEmail,
  DocsGetAllowedEmails,
  DocsRemoveAllowedEmail,
} from './docs/admin.docs';
import { DocsUpdateUserPermissions } from './docs/auth.docs';

@Controller('admin/emails')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private allowedEmailsService: AllowedEmailsService,
    private mailService: MailService,
  ) {}

  // Добавить email в список разрешенных
  @Post()
  @DocsAddAllowedEmail()
  async addAllowedEmail(@Body() email: AddAllowedEmailDto) {
    // Добавляем email
    const allowedEmail = await this.allowedEmailsService.addAllowedEmail(
      email.email,
    );

    // Отправляем приглашение пользователю
    await this.mailService.sendRegistrationInvite(email.email, 'Администратор');

    return allowedEmail;
  }

  // Удалить email из списка разрешенных
  @Delete(':id')
  @DocsRemoveAllowedEmail()
  async removeAllowedEmail(@Param('id', ParseIntPipe) id: number) {
    return await this.allowedEmailsService.removeAllowedEmail(id);
  }

  // Получить список всех разрешенных email
  @Get()
  @DocsGetAllowedEmails()
  async getAllowedEmails() {
    return this.allowedEmailsService.getAllowedEmails();
  }

  @Patch('users/:id/permissions')
  @DocsUpdateUserPermissions()
  async updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePermissionsDto,
  ) {
    return this.allowedEmailsService.updateUserPermissions(id, dto.permissions);
  }
}
