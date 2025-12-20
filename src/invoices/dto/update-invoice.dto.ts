import { IsString, IsNumber, IsArray, ValidateNested, IsOptional, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateInvoiceItemDto {
  @IsString()
  designation: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_price: number;
}

export class UpdateInvoiceDto {
  @IsString()
  organization_id: string;

  @IsString()
  @IsIn(['definitive', 'proforma'])
  type: string;

  @IsNumber()
  @Min(0)
  vat_rate: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInvoiceItemDto)
  items: UpdateInvoiceItemDto[];

  @IsOptional()
  @IsString()
  client_name?: string;

  @IsOptional()
  @IsString()
  client_address?: string;
}
