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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let OrganizationsService = class OrganizationsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getAppUserId(authUserId) {
        const supabase = this.supabaseService.getClient();
        const { data } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', authUserId)
            .single();
        if (!data?.id) {
            throw new common_1.ForbiddenException('Utilisateur non enregistré');
        }
        return data.id;
    }
    async createOrganization(userId, createOrganizationDto) {
        const supabase = this.supabaseService.getClient();
        const { data: adminRow } = await supabase
            .from('users')
            .select('is_admin')
            .eq('auth_id', userId)
            .single();
        if (!adminRow?.is_admin) {
            throw new common_1.ForbiddenException('Création d\'établissement réservée à l\'administrateur');
        }
        throw new common_1.ForbiddenException('Création d\'établissement réservée au portail admin');
    }
    async getUserOrganizations(userId) {
        const supabase = this.supabaseService.getClient();
        const appUserId = await this.getAppUserId(userId);
        const { data, error } = await supabase
            .from('user_organizations')
            .select('organization_id, role, organizations(*)')
            .eq('user_id', appUserId);
        if (error)
            throw error;
        return data.map((item) => ({
            ...item.organizations,
            user_role: item.role,
        }));
    }
    async getOrganization(userId, organizationId) {
        const supabase = this.supabaseService.getClient();
        const appUserId = await this.getAppUserId(userId);
        await this.verifyUserAccess(appUserId, organizationId);
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', organizationId)
            .single();
        if (orgError || !org) {
            throw new common_1.NotFoundException('Organisation introuvable');
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
    async updateOrganization(userId, organizationId, updateOrganizationDto) {
        const supabase = this.supabaseService.getClient();
        const appUserId = await this.getAppUserId(userId);
        await this.verifyAdminAccess(appUserId, organizationId);
        const { error } = await supabase
            .from('organizations')
            .update(updateOrganizationDto)
            .eq('id', organizationId);
        if (error)
            throw error;
        return this.getOrganization(userId, organizationId);
    }
    async updateOrganizationSettings(userId, organizationId, updateSettingsDto) {
        const supabase = this.supabaseService.getClient();
        const appUserId = await this.getAppUserId(userId);
        await this.verifyAdminAccess(appUserId, organizationId);
        const { error } = await supabase
            .from('organization_settings')
            .update(updateSettingsDto)
            .eq('organization_id', organizationId);
        if (error)
            throw error;
        return this.getOrganization(userId, organizationId);
    }
    async getOrganizationSettings(userId, organizationId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('organization_settings')
            .select('*')
            .eq('organization_id', organizationId)
            .single();
        if (error)
            throw error;
        return data;
    }
    async verifyUserAccess(appUserId, organizationId) {
        const supabase = this.supabaseService.getClient();
        const { data } = await supabase
            .from('user_organizations')
            .select('role')
            .eq('user_id', appUserId)
            .eq('organization_id', organizationId)
            .single();
        if (!data) {
            throw new common_1.ForbiddenException('Accès interdit à cette organisation');
        }
        return data.role;
    }
    async verifyAdminAccess(appUserId, organizationId) {
        const role = await this.verifyUserAccess(appUserId, organizationId);
        if (!['owner', 'admin'].includes(role)) {
            throw new common_1.ForbiddenException('Droits administrateur requis');
        }
        return role;
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map