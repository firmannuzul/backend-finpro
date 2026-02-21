import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { Role } from "../../../../generated/prisma/enums.js";

export class RegisterAdminDTO {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
