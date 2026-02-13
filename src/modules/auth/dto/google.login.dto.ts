import { IsString } from "class-validator";

export class GoogleLoginDTO {
  @IsString()
  accessToken!: string;
}
