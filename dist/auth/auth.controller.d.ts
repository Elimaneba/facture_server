import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getCurrentUser(user: any): Promise<{
        id: any;
        auth_id: any;
        email: any;
        full_name: any;
        phone: any;
        is_admin: any;
        created_at: any;
    }>;
}
