import {
  IsString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
  IsDefined,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ClientPriority, ClientStatus } from 'src/generated/prisma/enums';

export class CreateClientDto {
  @IsDefined({ message: 'Имя клиента обязательно' })
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(100, { message: 'Имя не может превышать 100 символов' })
  @Matches(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/, {
    message: 'Имя может содержать только буквы, пробелы и дефисы',
  })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный формат email' })
  @MaxLength(255, { message: 'Email не может превышать 255 символов' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsPhoneNumber(null, { message: 'Некорректный номер телефона' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Компания должна быть строкой' })
  @MaxLength(200, {
    message: 'Название компании не может превышать 200 символов',
  })
  company?: string;

  @IsOptional()
  @IsString({ message: 'Должность должна быть строкой' })
  @MaxLength(100, { message: 'Должность не может превышать 100 символов' })
  position?: string;

  @IsOptional()
  @IsString({ message: 'Адрес должен быть строкой' })
  @MaxLength(500, { message: 'Адрес не может превышать 500 символов' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Город должен быть строкой' })
  @MaxLength(100, {
    message: 'Название города не может превышать 100 символов',
  })
  city?: string;

  @IsOptional()
  @IsString({ message: 'Страна должна быть строкой' })
  @MaxLength(100, {
    message: 'Название страны не может превышать 100 символов',
  })
  @Transform(({ value }) => value || 'Россия')
  country?: string;

  @IsOptional()
  @IsEnum(ClientStatus, { message: 'Некорректный статус клиента' })
  status?: ClientStatus;

  @IsOptional()
  @IsEnum(ClientPriority, { message: 'Некорректный приоритет клиента' })
  priority?: ClientPriority;
}

export class UpdateClientDto {
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(100, { message: 'Имя не может превышать 100 символов' })
  @Matches(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/, {
    message: 'Имя может содержать только буквы, пробелы и дефисы',
  })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный формат email' })
  @MaxLength(255, { message: 'Email не может превышать 255 символов' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Компания должна быть строкой' })
  @MaxLength(200, {
    message: 'Название компании не может превышать 200 символов',
  })
  company?: string;

  @IsOptional()
  @IsString({ message: 'Должность должна быть строкой' })
  @MaxLength(100, { message: 'Должность не может превышать 100 символов' })
  position?: string;

  @IsOptional()
  @IsString({ message: 'Адрес должен быть строкой' })
  @MaxLength(500, { message: 'Адрес не может превышать 500 символов' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Город должен быть строкой' })
  @MaxLength(100, {
    message: 'Название города не может превышать 100 символов',
  })
  city?: string;

  @IsOptional()
  @IsString({ message: 'Страна должна быть строкой' })
  @MaxLength(100, {
    message: 'Название страны не может превышать 100 символов',
  })
  country?: string;

  @IsOptional()
  @IsEnum(ClientStatus, { message: 'Некорректный статус клиента' })
  status?: ClientStatus;

  @IsOptional()
  @IsEnum(ClientPriority, { message: 'Некорректный приоритет клиента' })
  priority?: ClientPriority;
}
