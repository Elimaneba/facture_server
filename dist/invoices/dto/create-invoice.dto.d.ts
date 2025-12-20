export declare class InvoiceItemDto {
    designation: string;
    quantity: number;
    unit_price: number;
}
export declare class CreateInvoiceDto {
    organization_id: string;
    type: 'definitive' | 'proforma';
    vat_rate: number;
    items: InvoiceItemDto[];
    client_name?: string;
    client_address?: string;
}
