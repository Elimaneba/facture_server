declare class UpdateInvoiceItemDto {
    designation: string;
    quantity: number;
    unit_price: number;
}
export declare class UpdateInvoiceDto {
    organization_id: string;
    type: string;
    vat_rate: number;
    items: UpdateInvoiceItemDto[];
    client_name?: string;
    client_address?: string;
}
export {};
