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
import { ClientService } from './client.service';
import { CreateClientDto, UpdateClientDto } from './client.dto';
import {
  DocsCreateClient,
  DocsFindAllClients,
  DocsUpdateClient,
  DocsRemoveClient,
} from './client.docs';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { Permission } from 'src/generated/prisma/enums';

@Controller('client')
@UseGuards(AuthGuard, PermissionGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @RequirePermission(Permission.ACCESS_SALES)
  @DocsCreateClient()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  @RequirePermission(Permission.ACCESS_SALES)
  @DocsFindAllClients()
  findAll() {
    return this.clientService.findAll();
  }

  @Patch(':id')
  @RequirePermission(Permission.ACCESS_SALES)
  @DocsUpdateClient()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientService.update(id, updateClientDto);
  }

  @Delete(':id')
  @RequirePermission(Permission.ACCESS_SALES)
  @DocsRemoveClient()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.remove(id);
  }
}
