import { SupabaseService } from '../supabase/supabase.service';
export declare class AuthService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    getCurrentUser(userId: string): Promise<{
        id: any;
        auth_id: any;
        email: any;
        full_name: any;
        phone: any;
        is_admin: any;
        created_at: any;
    }>;
}
