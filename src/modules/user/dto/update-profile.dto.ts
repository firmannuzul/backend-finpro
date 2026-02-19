// import { Gender } from "@prisma/client";
// import { isEnum, IsNotEmpty, IsString } from "class-validator";

// export class UpdateProfileDTO {
//   @IsNotEmpty()
//   @IsString()
//   name!: string;

//   @IsNotEmpty()
//   @isEnum(Gender, {})
//   gender!: Gender;

//   @IsNotEmpty()
//   @IsString()
//   dob!: string;

//   @IsNotEmpty()
//   @IsString()
//   phone!: string;

//   @IsNotEmpty()
//   @IsString()
//   address!: string;

//   @IsNotEmpty()
//   @IsString()
//   lastEducation!: string;
// }

import { Gender } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

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
