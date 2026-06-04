import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto, UpdateSaleDto, AddCommentDto } from './sale.dto';
import {
  DocsCreateSale,
  DocsFindAllSales,
  DocsUpdateSale,
  DocsRemoveSale,
  DocsFindSalesByClient,
  DocsFindSalesByManager,
  DocsAddComment,
} from './sale.docs';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/generated/prisma/enums';
import { RequirePermission } from 'src/common/decorators/permission.decorator';

@Controller('sale')
@UseGuards(AuthGuard, PermissionGuard)
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @RequirePermission(Permission.ACCESS_SALES)
  @DocsCreateSale()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.saleService.create(createSaleDto);
  }

  @Get()
  @RequirePermission(Permission.ACCESS_SALES)
  @DocsFindAllSales()
  findAll() {
    return this.saleService.findAll();
  }

  @Get('client/:clientId')
  @RequirePermission(Permission.ACCESS_SALES)
  @DocsFindSalesByClient()
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.saleService.findByClient(clientId);
  }

  @Get('manager/:managerId')
  @RequirePermission(Permission.ACCESS_SALES)
  @DocsFindSalesByManager()
  findByManager(@Param('managerId', ParseIntPipe) managerId: number) {
    return this.saleService.findByManager(managerId);
  }

  @Patch(':id')
  @RequirePermission(Permission.ACCESS_SALES)
  @DocsUpdateSale()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSaleDto: UpdateSaleDto,
  ) {
    return this.saleService.update(id, updateSaleDto);
  }

  @Delete(':id')
  @RequirePermission(Permission.ACCESS_SALES)
  @DocsRemoveSale()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.saleService.remove(id);
  }

  @Post(':id/comments')
  @RequirePermission(Permission.ACCESS_SALES)
  @DocsAddComment()
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() addCommentDto: AddCommentDto,
  ) {
    return this.saleService.addComment(id, addCommentDto.comment);
  }
}
