import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    create(user: any, createInvoiceDto: CreateInvoiceDto): Promise<any>;
    findAll(user: any, organizationId?: string): Promise<any[]>;
    findOne(user: any, id: string): Promise<any>;
    update(user: any, id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<any>;
    remove(user: any, id: string): Promise<{
        message: string;
    }>;
}
