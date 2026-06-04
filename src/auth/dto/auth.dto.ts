// modules/auth/dto/auth.dto.ts
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from 'src/generated/prisma/enums';

export class StartRegistryDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль (мин. 6 символов)',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Иван Петров', description: 'Имя пользователя' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  name: string;
}

export class EndRegistryDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 12345, description: 'Код подтверждения (5 цифр)' })
  @IsInt()
  @Min(10000)
  @Max(99999)
  @IsNotEmpty()
  code: number;
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Пароль' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 123456, description: 'Код подтверждения (6 цифр)' })
  @IsInt()
  @Min(100000)
  @Max(999999)
  @IsNotEmpty()
  code: number;

  @ApiProperty({
    example: 'newpassword123',
    description: 'Новый пароль (мин. 6 символов)',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsNotEmpty()
  password: string;
}

export class AddAllowedEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email для добавления в список разрешенных',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class RemoveAllowedEmailDto {
  @ApiProperty({ example: 1, description: 'ID записи в списке разрешенных' })
  @IsInt()
  @IsNotEmpty()
  id: number;
}

export class UpdatePermissionsDto {
  permissions: Permission[];
}
