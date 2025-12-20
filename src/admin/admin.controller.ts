import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { User } from '../common/decorators/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { CreateOrganizationDto } from '../organizations/dto/create-organization.dto';
import { UpdateOrganizationDto } from '../organizations/dto/update-organization.dto';
import { UpdateOrganizationSettingsDto } from '../organizations/dto/update-organization-settings.dto';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============================================
  // GESTION DES UTILISATEURS
  // ============================================

  @Post('users')
  async createUser(@User() user: any, @Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(user.id, createUserDto);
  }

  @Get('users')
  async getAllUsers(@User() user: any) {
    return this.adminService.getAllUsers(user.id);
  }

  @Get('users/:id')
  async getUserById(@User() user: any, @Param('id') id: string) {
    return this.adminService.getUserById(user.id, id);
  }

  @Put('users/:id')
  async updateUser(@User() user: any, @Param('id') id: string, @Body() updateData: Partial<CreateUserDto>) {
    return this.adminService.updateUser(user.id, id, updateData);
  }

  @Delete('users/:id')
  async deleteUser(@User() user: any, @Param('id') id: string) {
    return this.adminService.deleteUser(user.id, id);
  }

  // ============================================
  // GESTION DES ORGANISATIONS
  // ============================================

  @Post('organizations')
  async createOrganization(@User() user: any, @Body() createOrgDto: CreateOrganizationDto) {
    return this.adminService.createOrganization(user.id, createOrgDto);
  }

  @Get('organizations')
  async getAllOrganizations(@User() user: any) {
    return this.adminService.getAllOrganizations(user.id);
  }

  @Get('organizations/:id')
  async getOrganizationById(@User() user: any, @Param('id') id: string) {
    return this.adminService.getOrganizationById(user.id, id);
  }

  @Put('organizations/:id')
  async updateOrganization(@User() user: any, @Param('id') id: string, @Body() updateOrgDto: UpdateOrganizationDto) {
    return this.adminService.updateOrganization(user.id, id, updateOrgDto);
  }

  @Delete('organizations/:id')
  async deleteOrganization(@User() user: any, @Param('id') id: string) {
    return this.adminService.deleteOrganization(user.id, id);
  }

  // ============================================
  // AFFECTATION UTILISATEURS <-> ORGANISATIONS
  // ============================================

  @Post('assignments')
  async assignUserToOrganization(@User() user: any, @Body() assignDto: AssignUserDto) {
    return this.adminService.assignUserToOrganization(user.id, assignDto);
  }

  @Put('assignments/:userId/:orgId')
  async updateUserRole(
    @User() user: any,
    @Param('userId') userId: string,
    @Param('orgId') orgId: string,
    @Body() body: { role: 'owner' | 'user' },
  ) {
    return this.adminService.updateUserRole(user.id, userId, orgId, body.role);
  }

  @Delete('assignments/:userId/:orgId')
  async removeUserFromOrganization(
    @User() user: any,
    @Param('userId') userId: string,
    @Param('orgId') orgId: string,
  ) {
    return this.adminService.removeUserFromOrganization(user.id, userId, orgId);
  }

  @Get('organizations/:orgId/users')
  async getOrganizationUsers(@User() user: any, @Param('orgId') orgId: string) {
    return this.adminService.getOrganizationUsers(user.id, orgId);
  }

  @Get('users/:userId/organizations')
  async getUserOrganizations(@User() user: any, @Param('userId') userId: string) {
    return this.adminService.getUserOrganizations(user.id, userId);
  }

  @Put('organizations/:orgId/settings')
  async updateOrganizationSettings(
    @User() user: any,
    @Param('orgId') orgId: string,
    @Body() updateSettingsDto: UpdateOrganizationSettingsDto,
  ) {
    return this.adminService.updateOrganizationSettings(user.id, orgId, updateSettingsDto);
  }
}
