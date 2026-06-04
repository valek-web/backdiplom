import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  StartRegistryDto,
  EndRegistryDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdatePermissionsDto,
} from './dto/auth.dto';
import type { Request } from 'express';
import { SingTokenType } from 'src/common/types';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  DocsForgotPassword,
  DocsLogin,
  DocsLogout,
  DocsRefreshTokens,
  DocsRegisterEnd,
  DocsRegisterStart,
  DocsResetPassword,
  DocsUpdateUserPermissions,
  DocsValidateToken,
} from './docs/auth.docs';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @DocsRegisterStart()
  async registerStart(@Body() registerDto: StartRegistryDto) {
    return this.authService.registerStart(registerDto);
  }

  @Post('register-send-code')
  @DocsRegisterEnd()
  async registerEnd(@Body() registerDto: EndRegistryDto) {
    return this.authService.registerEnd(registerDto);
  }

  @Post('login')
  @DocsLogin()
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @DocsLogout()
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('Пользователь не найден в запросе');
    }
    const user = req.user as SingTokenType;
    return this.authService.logout(user.sub);
  }

  @Post('refresh')
  @DocsRefreshTokens()
  @UseGuards(RefreshTokenGuard)
  async refreshTokens(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('Пользователь не найден в запросе');
    }
    const user = req.user as SingTokenType;
    return this.authService.refreshTokens(user.sub);
  }

  @Post('validate')
  @DocsValidateToken()
  @UseGuards(AuthGuard)
  async validateTokens(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('Пользователь не найден в запросе');
    }
    const user = req.user as SingTokenType;
    return this.authService.validateAccessToken(user.sub);
  }

  @Post('forgot-password')
  @DocsForgotPassword()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @DocsResetPassword()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
