import jwt from "jsonwebtoken";
import {
  AuthProvider,
  PrismaClient,
} from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { MailService } from "../mail/mail.service.js";
import { ForgotPasswordDTO } from "./dto/forgot-password.dto.js";
import { LoginDTO } from "./dto/login.dto.js";
import { RegisterAdminDTO } from "./dto/register-admin.dto.js";
import { RegisterDTO } from "./dto/register.dto.js";
import { ResetPasswordDTO } from "./dto/reset-password.dto.js";

export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private mailService: MailService = new MailService(),
  ) {}

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
        provider: AuthProvider.CREDENTIALS,
      },
    });

    return { message: "register success" };
  };

  registerAdmin = async (body: RegisterAdminDTO) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (user) throw new ApiError("Email already exist", 400);

    const hashedPassword = await hashPassword(body.password);

    await this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        password: hashedPassword,
        role: body.role ?? "ADMIN",
        provider: AuthProvider.CREDENTIALS,
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

  forgotPassword = async (body: ForgotPasswordDTO) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (!user) throw new ApiError("User not found", 404);

    const payload = { id: user.id, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_RESET!, {
      expiresIn: "15m",
    });

    await this.mailService.sendEmail(
      body.email,
      "Forgot Password",
      "forgot-password",
      {
        resetUrl: `http://localhost:3000/reset-password/${accessToken}`,
      },
    );
    return { message: "send email success" };
  };

  resetPassword = async (body: ResetPasswordDTO, authUserId: number) => {
    const hashedPassword = await hashPassword(body.password);

    await this.prisma.user.update({
      where: { id: authUserId },
      data: { password: hashedPassword },
    });

    return { message: "reset password success" };
  };
}
