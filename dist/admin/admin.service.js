"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let AdminService = class AdminService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async resolveAppUserId(userIdOrAuthId) {
        const supabase = this.supabaseService.getClient();
        const { data: byId } = await supabase
            .from('users')
            .select('id')
            .eq('id', userIdOrAuthId)
            .single();
        if (byId?.id)
            return byId.id;
        const { data: byAuthId } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', userIdOrAuthId)
            .single();
        if (byAuthId?.id)
            return byAuthId.id;
        throw new common_1.NotFoundException('Utilisateur introuvable');
    }
    async verifyAdmin(userId) {
        const supabase = this.supabaseService.getClient();
        const { data: user } = await supabase
            .from('users')
            .select('is_admin')
            .eq('auth_id', userId)
            .single();
        if (!user || !user.is_admin) {
            throw new common_1.ForbiddenException('Accès admin requis');
        }
    }
    async createUser(adminId, createUserDto) {
        await this.verifyAdmin(adminId);
        const supabase = this.supabaseService.getClient();
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: createUserDto.email,
            password: createUserDto.password,
            email_confirm: true,
        });
        if (authError)
            throw authError;
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
        if (userError)
            throw userError;
        return userData;
    }
    async getAllUsers(adminId) {
        await this.verifyAdmin(adminId);
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async getUserById(adminId, userId) {
        await this.verifyAdmin(adminId);
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('Utilisateur introuvable');
        }
        return data;
    }
    async updateUser(adminId, userId, updateData) {
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
        if (error)
            throw error;
        return data;
    }
    async deleteUser(adminId, userId) {
        await this.verifyAdmin(adminId);
        const supabase = this.supabaseService.getClient();
        const { data: user } = await supabase
            .from('users')
            .select('auth_id')
            .eq('id', userId)
            .single();
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur introuvable');
        }
        const { error: authError } = await supabase.auth.admin.deleteUser(user.auth_id);
        if (authError)
            throw authError;
        return { message: 'Utilisateur supprimé avec succès' };
    }
    async createOrganization(adminId, createOrgDto) {
        await this.verifyAdmin(adminId);
        const supabase = this.supabaseService.getClient();
        const { data: adminUser } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', adminId)
            .single();
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
        if (orgError)
            throw orgError;
        await supabase.from('organization_settings').insert({
            organization_id: org.id,
        });
        return org;
    }
    async getAllOrganizations(adminId) {
        await this.verifyAdmin(adminId);
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async getOrganizationById(adminId, orgId) {
        await this.verifyAdmin(adminId);
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', orgId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('Organisation introuvable');
        }
        return data;
    }
    async updateOrganization(adminId, orgId, updateOrgDto) {
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
        if (error)
            throw error;
        return data;
    }
    async deleteOrganization(adminId, orgId) {
        await this.verifyAdmin(adminId);
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('organizations')
            .delete()
            .eq('id', orgId);
        if (error)
            throw error;
        return { message: 'Organisation supprimée avec succès' };
    }
    async assignUserToOrganization(adminId, assignDto) {
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
        if (error)
            throw error;
        return data;
    }
    async updateUserRole(adminId, userId, orgId, role) {
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
        if (error)
            throw error;
        return data;
    }
    async removeUserFromOrganization(adminId, userId, orgId) {
        await this.verifyAdmin(adminId);
        const supabase = this.supabaseService.getClient();
        const appUserId = await this.resolveAppUserId(userId);
        const { error } = await supabase
            .from('user_organizations')
            .delete()
            .eq('user_id', appUserId)
            .eq('organization_id', orgId);
        if (error)
            throw error;
        return { message: 'Utilisateur retiré de l\'organisation' };
    }
    async getOrganizationUsers(adminId, orgId) {
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
        if (error)
            throw error;
        return data;
    }
    async getUserOrganizations(adminId, userId) {
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
        if (error)
            throw error;
        return data;
    }
    async updateOrganizationSettings(adminId, orgId, updateSettingsDto) {
        await this.verifyAdmin(adminId);
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('organization_settings')
            .update(updateSettingsDto)
            .eq('organization_id', orgId);
        if (error)
            throw error;
        const { data: settings } = await supabase
            .from('organization_settings')
            .select('*')
            .eq('organization_id', orgId)
            .single();
        return settings;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AdminService);
//# sourceMappingURL=admin.service.js.map