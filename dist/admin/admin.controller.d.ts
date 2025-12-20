import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { CreateOrganizationDto } from '../organizations/dto/create-organization.dto';
import { UpdateOrganizationDto } from '../organizations/dto/update-organization.dto';
import { UpdateOrganizationSettingsDto } from '../organizations/dto/update-organization-settings.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createUser(user: any, createUserDto: CreateUserDto): Promise<any>;
    getAllUsers(user: any): Promise<any[]>;
    getUserById(user: any, id: string): Promise<any>;
    updateUser(user: any, id: string, updateData: Partial<CreateUserDto>): Promise<any>;
    deleteUser(user: any, id: string): Promise<{
        message: string;
    }>;
    createOrganization(user: any, createOrgDto: CreateOrganizationDto): Promise<any>;
    getAllOrganizations(user: any): Promise<any[]>;
    getOrganizationById(user: any, id: string): Promise<any>;
    updateOrganization(user: any, id: string, updateOrgDto: UpdateOrganizationDto): Promise<any>;
    deleteOrganization(user: any, id: string): Promise<{
        message: string;
    }>;
    assignUserToOrganization(user: any, assignDto: AssignUserDto): Promise<any>;
    updateUserRole(user: any, userId: string, orgId: string, body: {
        role: 'owner' | 'user';
    }): Promise<any>;
    removeUserFromOrganization(user: any, userId: string, orgId: string): Promise<{
        message: string;
    }>;
    getOrganizationUsers(user: any, orgId: string): Promise<{
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
    getUserOrganizations(user: any, userId: string): Promise<{
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
    updateOrganizationSettings(user: any, orgId: string, updateSettingsDto: UpdateOrganizationSettingsDto): Promise<any>;
}
