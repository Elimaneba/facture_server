import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { CreateOrganizationDto } from '../organizations/dto/create-organization.dto';
import { UpdateOrganizationDto } from '../organizations/dto/update-organization.dto';
import { UpdateOrganizationSettingsDto } from '../organizations/dto/update-organization-settings.dto';

@Injectable()
export class AdminService {
  constructor(private supabaseService: SupabaseService) {}

  private async resolveAppUserId(userIdOrAuthId: string): Promise<string> {
    const supabase = this.supabaseService.getClient();

    // 1) Try as app user id
    const { data: byId } = await supabase
      .from('users')
      .select('id')
      .eq('id', userIdOrAuthId)
      .single();

    if (byId?.id) return byId.id;

    // 2) Try as auth user id
    const { data: byAuthId } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userIdOrAuthId)
      .single();

    if (byAuthId?.id) return byAuthId.id;

    throw new NotFoundException('Utilisateur introuvable');
  }

  // Vérifier si l'utilisateur est admin
  async verifyAdmin(userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { data: user } = await supabase
      .from('users')
      .select('is_admin')
      .eq('auth_id', userId)
      .single();

    if (!user || !user.is_admin) {
      throw new ForbiddenException('Accès admin requis');
    }
  }

  // ============================================
  // GESTION DES UTILISATEURS
  // ============================================

  async createUser(adminId: string, createUserDto: CreateUserDto) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: createUserDto.email,
      password: createUserDto.password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Créer l'entrée dans la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        auth_id: authData.user.id,
        email: createUserDto.email,
        full_name: createUserDto.full_name,
        phone: createUserDto.phone,
        is_admin: createUserDto.is_admin || false,
      })
      .select()
      .single();

    if (userError) throw userError;

    return userData;
  }

  async getAllUsers(adminId: string) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getUserById(adminId: string, userId: string) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return data;
  }

  async updateUser(adminId: string, userId: string, updateData: Partial<CreateUserDto>) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: updateData.full_name,
        phone: updateData.phone,
        is_admin: updateData.is_admin,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteUser(adminId: string, userId: string) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    // Récupérer l'auth_id
    const { data: user } = await supabase
      .from('users')
      .select('auth_id')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Supprimer de Auth (cascade supprimera de users)
    const { error: authError } = await supabase.auth.admin.deleteUser(user.auth_id);

    if (authError) throw authError;

    return { message: 'Utilisateur supprimé avec succès' };
  }

  // ============================================
  // GESTION DES ORGANISATIONS
  // ============================================

  async createOrganization(adminId: string, createOrgDto: CreateOrganizationDto) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    // Récupérer l'ID de l'admin dans la table users
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', adminId)
      .single();

    // Créer l'organisation
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: createOrgDto.name,
        email: createOrgDto.email,
        phone: createOrgDto.phone,
        address: createOrgDto.address,
        city: createOrgDto.city,
        postal_code: createOrgDto.postal_code,
        country: createOrgDto.country,
        tax_number: createOrgDto.tax_number,
        created_by: adminUser?.id,
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // Créer les settings par défaut
    await supabase.from('organization_settings').insert({
      organization_id: org.id,
    });

    return org;
  }

  async getAllOrganizations(adminId: string) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getOrganizationById(adminId: string, orgId: string) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Organisation introuvable');
    }

    return data;
  }

  async updateOrganization(adminId: string, orgId: string, updateOrgDto: UpdateOrganizationDto) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('organizations')
      .update({
        name: updateOrgDto.name,
        email: updateOrgDto.email,
        phone: updateOrgDto.phone,
        address: updateOrgDto.address,
        city: updateOrgDto.city,
        postal_code: updateOrgDto.postal_code,
        country: updateOrgDto.country,
        tax_number: updateOrgDto.tax_number,
      })
      .eq('id', orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteOrganization(adminId: string, orgId: string) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', orgId);

    if (error) throw error;

    return { message: 'Organisation supprimée avec succès' };
  }

  // ============================================
  // AFFECTATION UTILISATEURS <-> ORGANISATIONS
  // ============================================

  async assignUserToOrganization(adminId: string, assignDto: AssignUserDto) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    const appUserId = await this.resolveAppUserId(assignDto.user_id);

    const { data, error } = await supabase
      .from('user_organizations')
      .insert({
        user_id: appUserId,
        organization_id: assignDto.organization_id,
        role: assignDto.role,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserRole(adminId: string, userId: string, orgId: string, role: 'owner' | 'user') {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    const appUserId = await this.resolveAppUserId(userId);

    const { data, error } = await supabase
      .from('user_organizations')
      .update({ role })
      .eq('user_id', appUserId)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeUserFromOrganization(adminId: string, userId: string, orgId: string) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    const appUserId = await this.resolveAppUserId(userId);

    const { error } = await supabase
      .from('user_organizations')
      .delete()
      .eq('user_id', appUserId)
      .eq('organization_id', orgId);

    if (error) throw error;

    return { message: 'Utilisateur retiré de l\'organisation' };
  }

  async getOrganizationUsers(adminId: string, orgId: string) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        id,
        role,
        created_at,
        user:users (
          id,
          email,
          full_name,
          phone,
          is_admin
        )
      `)
      .eq('organization_id', orgId);

    if (error) throw error;
    return data;
  }

  async getUserOrganizations(adminId: string, userId: string) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        id,
        role,
        created_at,
        organization:organizations (
          id,
          name,
          email,
          phone,
          city,
          country
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  async updateOrganizationSettings(adminId: string, orgId: string, updateSettingsDto: UpdateOrganizationSettingsDto) {
    await this.verifyAdmin(adminId);

    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('organization_settings')
      .update(updateSettingsDto)
      .eq('organization_id', orgId);

    if (error) throw error;

    // Retourner les settings mis à jour
    const { data: settings } = await supabase
      .from('organization_settings')
      .select('*')
      .eq('organization_id', orgId)
      .single();

    return settings;
  }
}
