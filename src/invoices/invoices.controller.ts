import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { User } from '../common/decorators/user.decorator';

@Controller('invoices')
@UseGuards(AuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(@User() user: any, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.createInvoice(user.id, createInvoiceDto);
  }

  @Get()
  async findAll(@User() user: any, @Query('organizationId') organizationId?: string) {
    return this.invoicesService.getInvoices(user.id, organizationId);
  }

  @Get(':id')
  async findOne(@User() user: any, @Param('id') id: string) {
    return this.invoicesService.getInvoiceById(user.id, id);
  }

  @Put(':id')
  async update(@User() user: any, @Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.updateInvoice(user.id, id, updateInvoiceDto);
  }

  @Delete(':id')
  async remove(@User() user: any, @Param('id') id: string) {
    return this.invoicesService.deleteInvoice(user.id, id);
  }
}
