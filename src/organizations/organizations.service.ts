import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';

@Injectable()
export class OrganizationsService {
  constructor(private supabaseService: SupabaseService) {}

  private async getAppUserId(authUserId: string): Promise<string> {
    const supabase = this.supabaseService.getClient();

    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authUserId)
      .single();

    if (!data?.id) {
      throw new ForbiddenException('Utilisateur non enregistré');
    }

    return data.id;
  }

  async createOrganization(userId: string, createOrganizationDto: CreateOrganizationDto) {
    const supabase = this.supabaseService.getClient();

    // IMPORTANT: la création d'établissement est réservée au super-admin
    const { data: adminRow } = await supabase
      .from('users')
      .select('is_admin')
      .eq('auth_id', userId)
      .single();

    if (!adminRow?.is_admin) {
      throw new ForbiddenException('Création d\'établissement réservée à l\'administrateur');
    }

    throw new ForbiddenException('Création d\'établissement réservée au portail admin');
  }

  async getUserOrganizations(userId: string) {
    const supabase = this.supabaseService.getClient();

    const appUserId = await this.getAppUserId(userId);

    const { data, error } = await supabase
      .from('user_organizations')
      .select('organization_id, role, organizations(*)')
      .eq('user_id', appUserId);

    if (error) throw error;

    return data.map((item) => ({
      ...item.organizations,
      user_role: item.role,
    }));
  }

  async getOrganization(userId: string, organizationId: string) {
    const supabase = this.supabaseService.getClient();

    const appUserId = await this.getAppUserId(userId);

    await this.verifyUserAccess(appUserId, organizationId);

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      throw new NotFoundException('Organisation introuvable');
    }

    const { data: settings } = await supabase
      .from('organization_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    const { data: userRole } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', appUserId)
      .eq('organization_id', organizationId)
      .single();

    return {
      ...org,
      settings,
      user_role: userRole?.role,
    };
  }

  async updateOrganization(userId: string, organizationId: string, updateOrganizationDto: UpdateOrganizationDto) {
    const supabase = this.supabaseService.getClient();

    const appUserId = await this.getAppUserId(userId);

    await this.verifyAdminAccess(appUserId, organizationId);

    const { error } = await supabase
      .from('organizations')
      .update(updateOrganizationDto)
      .eq('id', organizationId);

    if (error) throw error;

    return this.getOrganization(userId, organizationId);
  }

  async updateOrganizationSettings(userId: string, organizationId: string, updateSettingsDto: UpdateOrganizationSettingsDto) {
    const supabase = this.supabaseService.getClient();

    const appUserId = await this.getAppUserId(userId);

    await this.verifyAdminAccess(appUserId, organizationId);

    const { error } = await supabase
      .from('organization_settings')
      .update(updateSettingsDto)
      .eq('organization_id', organizationId);

    if (error) throw error;

    return this.getOrganization(userId, organizationId);
  }

  async getOrganizationSettings(userId: string, organizationId: string) {
    const supabase = this.supabaseService.getClient();

    // Les settings (logo, couleurs) sont accessibles en lecture à tous les utilisateurs
    // car ils sont nécessaires pour afficher les factures
    const { data, error } = await supabase
      .from('organization_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error) throw error;

    return data;
  }

  private async verifyUserAccess(appUserId: string, organizationId: string) {
    const supabase = this.supabaseService.getClient();

    const { data } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', appUserId)
      .eq('organization_id', organizationId)
      .single();

    if (!data) {
      throw new ForbiddenException('Accès interdit à cette organisation');
    }

    return data.role;
  }

  private async verifyAdminAccess(appUserId: string, organizationId: string) {
    const role = await this.verifyUserAccess(appUserId, organizationId);

    if (!['owner', 'admin'].includes(role)) {
      throw new ForbiddenException('Droits administrateur requis');
    }

    return role;
  }
}
