import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { hashPassword } from "../../utils/password.js";
import { RegisterDTO } from "./dto/register.dto.js";

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  register = async (body: RegisterDTO) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (user) throw new ApiError("email already exist", 400);

    const hashedPassword = await hashPassword(body.password);

    await this.prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
      },
    });

    return { message: "register success" };
  };
}
