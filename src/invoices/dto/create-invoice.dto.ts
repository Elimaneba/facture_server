import { IsString, IsEnum, IsNumber, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsString()
  designation: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_price: number;
}

export class CreateInvoiceDto {
  @IsString()
  organization_id: string;

  @IsEnum(['definitive', 'proforma'])
  type: 'definitive' | 'proforma';

  @IsNumber()
  @Min(0)
  vat_rate: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsOptional()
  @IsString()
  client_name?: string;

  @IsOptional()
  @IsString()
  client_address?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  labor_cost?: number;
}
