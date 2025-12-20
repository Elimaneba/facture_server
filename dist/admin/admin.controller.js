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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const auth_guard_1 = require("../common/guards/auth.guard");
const user_decorator_1 = require("../common/decorators/user.decorator");
const create_user_dto_1 = require("./dto/create-user.dto");
const assign_user_dto_1 = require("./dto/assign-user.dto");
const create_organization_dto_1 = require("../organizations/dto/create-organization.dto");
const update_organization_dto_1 = require("../organizations/dto/update-organization.dto");
const update_organization_settings_dto_1 = require("../organizations/dto/update-organization-settings.dto");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async createUser(user, createUserDto) {
        return this.adminService.createUser(user.id, createUserDto);
    }
    async getAllUsers(user) {
        return this.adminService.getAllUsers(user.id);
    }
    async getUserById(user, id) {
        return this.adminService.getUserById(user.id, id);
    }
    async updateUser(user, id, updateData) {
        return this.adminService.updateUser(user.id, id, updateData);
    }
    async deleteUser(user, id) {
        return this.adminService.deleteUser(user.id, id);
    }
    async createOrganization(user, createOrgDto) {
        return this.adminService.createOrganization(user.id, createOrgDto);
    }
    async getAllOrganizations(user) {
        return this.adminService.getAllOrganizations(user.id);
    }
    async getOrganizationById(user, id) {
        return this.adminService.getOrganizationById(user.id, id);
    }
    async updateOrganization(user, id, updateOrgDto) {
        return this.adminService.updateOrganization(user.id, id, updateOrgDto);
    }
    async deleteOrganization(user, id) {
        return this.adminService.deleteOrganization(user.id, id);
    }
    async assignUserToOrganization(user, assignDto) {
        return this.adminService.assignUserToOrganization(user.id, assignDto);
    }
    async updateUserRole(user, userId, orgId, body) {
        return this.adminService.updateUserRole(user.id, userId, orgId, body.role);
    }
    async removeUserFromOrganization(user, userId, orgId) {
        return this.adminService.removeUserFromOrganization(user.id, userId, orgId);
    }
    async getOrganizationUsers(user, orgId) {
        return this.adminService.getOrganizationUsers(user.id, orgId);
    }
    async getUserOrganizations(user, userId) {
        return this.adminService.getUserOrganizations(user.id, userId);
    }
    async updateOrganizationSettings(user, orgId, updateSettingsDto) {
        return this.adminService.updateOrganizationSettings(user.id, orgId, updateSettingsDto);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('organizations'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_organization_dto_1.CreateOrganizationDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createOrganization", null);
__decorate([
    (0, common_1.Get)('organizations'),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllOrganizations", null);
__decorate([
    (0, common_1.Get)('organizations/:id'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrganizationById", null);
__decorate([
    (0, common_1.Put)('organizations/:id'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_organization_dto_1.UpdateOrganizationDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateOrganization", null);
__decorate([
    (0, common_1.Delete)('organizations/:id'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteOrganization", null);
__decorate([
    (0, common_1.Post)('assignments'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, assign_user_dto_1.AssignUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "assignUserToOrganization", null);
__decorate([
    (0, common_1.Put)('assignments/:userId/:orgId'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Param)('orgId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Delete)('assignments/:userId/:orgId'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Param)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeUserFromOrganization", null);
__decorate([
    (0, common_1.Get)('organizations/:orgId/users'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrganizationUsers", null);
__decorate([
    (0, common_1.Get)('users/:userId/organizations'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserOrganizations", null);
__decorate([
    (0, common_1.Put)('organizations/:orgId/settings'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('orgId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_organization_settings_dto_1.UpdateOrganizationSettingsDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateOrganizationSettings", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map