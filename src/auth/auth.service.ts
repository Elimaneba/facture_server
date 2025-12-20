import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async getCurrentUser(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('id, auth_id, email, full_name, phone, is_admin, created_at')
      .eq('auth_id', userId)
      .single();

    if (error) {
      // Si l'utilisateur n'existe pas dans la table users, retourner des infos de base
      return {
        id: null,
        auth_id: userId,
        email: null,
        full_name: null,
        phone: null,
        is_admin: false,
        created_at: null,
      };
    }

    return data;
  }
}
