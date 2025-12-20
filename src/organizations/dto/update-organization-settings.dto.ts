import { IsString, IsBoolean, IsOptional, IsHexColor, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrganizationSettingsDto {
  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  header_height?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  header_width?: number;

  @IsOptional()
  @IsString()
  @IsIn(['left', 'center', 'right'])
  header_position?: string;

  @IsOptional()
  @IsHexColor()
  primary_color?: string;

  @IsOptional()
  @IsHexColor()
  secondary_color?: string;

  @IsOptional()
  @IsString()
  font_family?: string;

  @IsOptional()
  @IsString()
  header_text?: string;

  @IsOptional()
  @IsString()
  footer_text?: string;

  @IsOptional()
  @IsBoolean()
  show_logo?: boolean;

  @IsOptional()
  @IsBoolean()
  show_company_info?: boolean;
}
