import { IsNotEmpty, IsString } from "class-validator";

export class ApplyJobDTO {
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber!: string;

  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsNotEmpty()
  @IsString()
  lastEducation!: string;

  //   @IsNotEmpty()
  //   @IsString()
  //   userId!: string;

  @IsNotEmpty()
  @IsString()
  jobPostingId!: string;
}
