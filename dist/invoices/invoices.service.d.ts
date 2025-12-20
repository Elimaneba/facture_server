import { SupabaseService } from '../supabase/supabase.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
export declare class InvoicesService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    private getAppUserId;
    createInvoice(userId: string, createInvoiceDto: CreateInvoiceDto): Promise<any>;
    getInvoices(userId: string, organizationId?: string): Promise<any[]>;
    getInvoiceById(userId: string, invoiceId: string): Promise<any>;
    updateInvoice(userId: string, invoiceId: string, updateInvoiceDto: UpdateInvoiceDto): Promise<any>;
    deleteInvoice(userId: string, invoiceId: string): Promise<{
        message: string;
    }>;
    private generateInvoiceNumber;
    private verifyOrganizationAccess;
}
