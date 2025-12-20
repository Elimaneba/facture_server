import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { CreateOrganizationDto } from '../organizations/dto/create-organization.dto';
import { UpdateOrganizationDto } from '../organizations/dto/update-organization.dto';
import { UpdateOrganizationSettingsDto } from '../organizations/dto/update-organization-settings.dto';
export declare class AdminService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    private resolveAppUserId;
    verifyAdmin(userId: string): Promise<void>;
    createUser(adminId: string, createUserDto: CreateUserDto): Promise<any>;
    getAllUsers(adminId: string): Promise<any[]>;
    getUserById(adminId: string, userId: string): Promise<any>;
    updateUser(adminId: string, userId: string, updateData: Partial<CreateUserDto>): Promise<any>;
    deleteUser(adminId: string, userId: string): Promise<{
        message: string;
    }>;
    createOrganization(adminId: string, createOrgDto: CreateOrganizationDto): Promise<any>;
    getAllOrganizations(adminId: string): Promise<any[]>;
    getOrganizationById(adminId: string, orgId: string): Promise<any>;
    updateOrganization(adminId: string, orgId: string, updateOrgDto: UpdateOrganizationDto): Promise<any>;
    deleteOrganization(adminId: string, orgId: string): Promise<{
        message: string;
    }>;
    assignUserToOrganization(adminId: string, assignDto: AssignUserDto): Promise<any>;
    updateUserRole(adminId: string, userId: string, orgId: string, role: 'owner' | 'user'): Promise<any>;
    removeUserFromOrganization(adminId: string, userId: string, orgId: string): Promise<{
        message: string;
    }>;
    getOrganizationUsers(adminId: string, orgId: string): Promise<{
        id: any;
        role: any;
        created_at: any;
        user: {
            id: any;
            email: any;
            full_name: any;
            phone: any;
            is_admin: any;
        }[];
    }[]>;
    getUserOrganizations(adminId: string, userId: string): Promise<{
        id: any;
        role: any;
        created_at: any;
        organization: {
            id: any;
            name: any;
            email: any;
            phone: any;
            city: any;
            country: any;
        }[];
    }[]>;
    updateOrganizationSettings(adminId: string, orgId: string, updateSettingsDto: UpdateOrganizationSettingsDto): Promise<any>;
}
