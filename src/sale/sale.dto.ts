import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  MaxLength,
  IsArray,
  IsDate,
  IsNotEmpty,
  ValidateNested,
  ArrayMaxSize,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProductDto {
  @ApiProperty({
    description: 'Название продукта/услуги',
    example: 'Ноутбук Lenovo ThinkPad',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Количество',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Цена за единицу',
    example: 75000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateSaleDto {
  @ApiProperty({
    description: 'Название продажи/сделки',
    example: 'Продажа оборудования для офиса',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Описание сделки',
    example: 'Комплексная поставка офисного оборудования для новой компании',
    required: false,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'Сумма сделки',
    example: 1500000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiProperty({
    description: 'ID клиента',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  clientId?: number;

  @ApiProperty({
    description: 'ID менеджера',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  managerId?: number;

  @ApiProperty({
    description: 'Список продуктов/услуг',
    type: [ProductDto],
    required: false,
    example: [
      { name: 'Ноутбук', quantity: 3, price: 75000 },
      { name: 'Монитор', quantity: 3, price: 25000 },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products?: ProductDto[];

  @ApiProperty({
    description: 'Комментарии к продаже',
    type: [String],
    required: false,
    example: ['Клиент заинтересован в скидке', 'Отправлено КП'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(100)
  comments?: string[];
}

export class UpdateSaleDto {
  @ApiProperty({
    description: 'Название продажи/сделки',
    example: 'Обновленная продажа оборудования',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    description: 'Описание сделки',
    example: 'Обновленное описание сделки',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'Сумма сделки',
    example: 1750000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({
    description: 'ID клиента',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  clientId?: number;

  @ApiProperty({
    description: 'ID менеджера',
    example: 7,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  managerId?: number;

  @ApiProperty({
    description: 'Список продуктов/услуг',
    type: [ProductDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products?: ProductDto[];

  @ApiProperty({
    description: 'Комментарии к продаже',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  comments?: string[];

  @ApiProperty({
    description: 'Дата закрытия сделки',
    example: '2024-02-15T14:30:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  closedAt?: Date;
}

export class AddCommentDto {
  @ApiProperty({
    description: 'Текст комментария',
    example: 'Клиент согласовал цену',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  comment: string;
}
