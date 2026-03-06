import { IsOptional, IsString } from "class-validator";

export class UpdateCompanyProfileDTO {
  @IsOptional()
  @IsString()
  companyName!: string;

  @IsOptional()
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  websiteUrl!: string;

  @IsOptional()
  @IsString()
  industry!: string;

  @IsOptional()
  @IsString()
  location!: string;
}
