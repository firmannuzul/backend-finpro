import jwt from "jsonwebtoken";
import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { LoginDTO } from "./dto/login.dto.js";
import { RegisterDTO } from "./dto/register.dto.js";

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  register = async (body: RegisterDTO) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (user) throw new ApiError("Email already exist", 400);

    const hashedPassword = await hashPassword(body.password);

    await this.prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        role: body.role ?? "APPLICANT",
      },
    });

    return { message: "register success" };
  };

  login = async (body: LoginDTO) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });
    if (!user || !user.password) throw new ApiError("Invalid credentials", 400);

    const isPasswordMatch = await comparePassword(body.password, user.password);

    if (!isPasswordMatch) throw new ApiError("Invalid credentials", 400);

    const payload = { id: user.id, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "2h",
    });

    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, accessToken };
  };
}
