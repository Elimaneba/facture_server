import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { User } from '../common/decorators/user.decorator';

@Controller('organizations')
@UseGuards(AuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async create(@User() user: any, @Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.createOrganization(user.id, createOrganizationDto);
  }

  @Get()
  async findAll(@User() user: any) {
    return this.organizationsService.getUserOrganizations(user.id);
  }

  @Get(':id')
  async findOne(@User() user: any, @Param('id') id: string) {
    return this.organizationsService.getOrganization(user.id, id);
  }

  @Put(':id')
  async update(@User() user: any, @Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationsService.updateOrganization(user.id, id, updateOrganizationDto);
  }

  @Get(':id/settings')
  async getSettings(@User() user: any, @Param('id') id: string) {
    return this.organizationsService.getOrganizationSettings(user.id, id);
  }

  @Put(':id/settings')
  async updateSettings(@User() user: any, @Param('id') id: string, @Body() updateSettingsDto: UpdateOrganizationSettingsDto) {
    return this.organizationsService.updateOrganizationSettings(user.id, id, updateSettingsDto);
  }
}
