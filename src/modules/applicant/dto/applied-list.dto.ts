import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AppliedListDTO {
  @IsNotEmpty()
  @IsString()
  appliedAt!: string;

  @IsNotEmpty()
  @IsString()
  status!: string;

  @IsNotEmpty()
  @IsString()
  thumbnail!: string;

  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsNotEmpty()
  @IsString()
  lastEducation!: string;

  @IsOptional()
  @IsString()
  expectedSalary!: string;
}
