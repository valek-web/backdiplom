import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { AllowedEmailsService } from './allowed-emails.service';
import { CodeGenerator } from '../common/utils/code-generator.util';
import * as bcrypt from 'bcryptjs';
import {
  StartRegistryDto,
  EndRegistryDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { DbService } from 'src/db/db.service';
import { RedisCodesService } from 'src/redis/redis-codes.service';
import { SingTokenType } from 'src/common/types';
import { Permission, User } from 'src/generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private db: DbService,
    private jwtService: JwtService,
    private mailService: MailService,
    private allowedEmailsService: AllowedEmailsService,
    private codeGenerator: CodeGenerator,
    private redisCodesService: RedisCodesService,
  ) {}

  // ========== РЕГИСТРАЦИЯ ==========
  async registerStart(registerDto: StartRegistryDto) {
    const { email, password, name } = registerDto;

    // 1. Проверяем, разрешен ли email для регистрации
    const isEmailAllowed =
      await this.allowedEmailsService.isEmailAllowed(email);
    if (!isEmailAllowed) {
      throw new ForbiddenException(
        'Регистрация с этим email не разрешена. Обратитесь к администратору.',
      );
    }

    // 2. Проверка существования пользователя
    const existingUser = await this.db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const code = Math.floor(10000 + Math.random() * 90000);

    this.redisCodesService.saveConfirmationData(email, {
      code,
      name,
      password,
    });

    this.mailService.sendRegistrationCode(email, code, name);

    return {
      message: 'Код отправлен на почту',
      code: code,
    };
  }

  async registerEnd(registerDto: EndRegistryDto) {
    const { email, code } = registerDto;
    try {
      const dataRegister =
        await this.redisCodesService.getConfirmationData(email);

      if (!dataRegister) {
        throw new NotFoundException('Пользователь не найден');
      }
      if (code !== dataRegister.code) {
        throw new BadRequestException('Неверный код подтверждения');
      }

      this.redisCodesService.deleteConfirmation(email);

      // 3. Хэширование пароля
      const hashedPassword = await bcrypt.hash(dataRegister.password, 10);

      // 5. Создание пользователя
      const user = await this.db.user.create({
        data: {
          email,
          password: hashedPassword,
          name: dataRegister.name,
        },
      });

      await this.db.allowedEmail.update({
        where: { email: user.email },
        data: {
          userId: user.id,
        },
      });

      // 7. Генерация токенов
      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        message: 'Регистрация успешно завершена.',
        ...tokens,
      };
    } catch (error) {
      throw new BadRequestException('Не удалось зарегистрировать пользователя');
    }
  }

  // ========== ЛОГИН ==========
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Поиск пользователя
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // 3. Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const updatedUser = await this.db.user.update({
      where: { email },
      data: {
        version: Math.floor(Date.now() / 1000),
      },
    });

    // 6. Генерация токенов
    const tokens = await this.generateTokens(updatedUser);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        permissions: user.permissions,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async logout(id: number) {
    await this.db.user.update({
      where: { id },
      data: {
        version: Math.floor(Date.now() / 1000),
      },
    });
    return {
      message: 'Токены отозваны',
    };
  }

  // ========== ОБНОВЛЕНИЕ ТОКЕНОВ ==========
  async refreshTokens(userId: number) {
    try {
      // 2. Ищем пользователя
      const user = await this.db.user.update({
        where: { id: userId },
        data: {
          version: Math.floor(Date.now() / 1000),
        },
      });

      // 3. Генерируем новые токены
      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          permissions: user.permissions,
          createdAt: user.createdAt,
        },
        ...tokens,
      };
    } catch (error) {
      throw new InternalServerErrorException('Внутренняя ошибка сервера');
    }
  }

  async validateAccessToken(userId: number) {
    try {
      // 2. Ищем пользователя
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new Error();

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          permissions: user.permissions,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Внутренняя ошибка сервера');
    }
  }

  // ========== СБРОС ПАРОЛЯ С КОДОМ ==========
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // 1. Поиск пользователя
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    // 3. Генерация 6-значного кода
    const resetCode = this.codeGenerator.generateNumericCode(6);

    this.redisCodesService.saveCode(email, resetCode);

    // 7. Отправка кода на почту
    await this.mailService.sendPasswordResetCode(
      user.email,
      resetCode,
      user.name,
    );

    return {
      message: 'На ваш email отправлен код для сброса пароля',
      // В разработке можно возвращать код для тестирования
      // ...(process.env.NODE_ENV === 'development' && { code: resetCode }),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code, password } = resetPasswordDto;
    const codeFromRedis = await this.redisCodesService.getCode(email);

    if (code !== codeFromRedis) {
      this.redisCodesService.delCode(email);
      throw new BadRequestException('Неверный код');
    }

    // 1. Поиск пользователя
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    // 4. Хэширование нового пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Обновление пароля и очистка токена
    await this.db.user.update({
      where: { email: email },
      data: {
        password: hashedPassword,
        version: Math.floor(Date.now() / 1000),
      },
    });

    // 6. Отправка уведомления
    await this.mailService.sendNoticeResetPassword(email);

    return {
      message: 'Пароль успешно изменен',
    };
  }

  // ========== ГЕНЕРАЦИЯ ТОКЕНОВ ==========
  private async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync<SingTokenType>(
        {
          sub: user.id,
          isSystemAdmin: user.isSystemAdmin,
          type: 'access',
          version: user.version,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES || '900'),
          // expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES || '30'),
        },
      ),
      this.jwtService.signAsync<SingTokenType>(
        {
          sub: user.id,
          isSystemAdmin: user.isSystemAdmin,
          type: 'refresh',
          version: user.version,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES || '604800'),
          // expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES || '120'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
