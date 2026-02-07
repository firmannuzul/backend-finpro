import {
  IsDate,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateJobDTO {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  category!: string;

  @IsNotEmpty()
  @IsString()
  location!: string;

  @IsNotEmpty()
  @IsString()
  salaryMin!: string;

  @IsNotEmpty()
  @IsString()
  salaryMax!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsString()
  companyId!: string;

  @IsOptional()
  // @IsDate()
  deadlineAt!: Date;
}
