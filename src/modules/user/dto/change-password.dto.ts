import { IsString } from "class-validator";

export class ChangePasswordDTO {
  @IsString()
  currentPassword!: string;

  @IsString()
  newPassword!: string;
}
