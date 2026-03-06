import { IsEnum, IsOptional, IsString } from "class-validator";
import { Gender } from "../../../../generated/prisma/enums.js";

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  name!: string;

  @IsEnum(Gender, {})
  @IsOptional()
  gender!: Gender;

  @IsOptional()
  @IsString()
  dob!: string;

  @IsOptional()
  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  lastEducation!: string;
}
