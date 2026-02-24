import { Router } from "express";
import { JwtMiddleware } from "../../middlewares/jwt.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AuthController } from "./auth.controller.js";
import { ForgotPasswordDTO } from "./dto/forgot-password.dto.js";
import { LoginDTO } from "./dto/login.dto.js";
import { RegisterAdminDTO } from "./dto/register-admin.dto.js";
import { RegisterDTO } from "./dto/register.dto.js";
import { ResetPasswordDTO } from "./dto/reset-password.dto.js";

export class AuthRouter {
  private router: Router;
  private jwtMiddleware: JwtMiddleware;

  constructor(
    private authController: AuthController,
    private validationMiddleware: ValidationMiddleware,
  ) {
    this.router = Router();
    this.jwtMiddleware = new JwtMiddleware();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    this.router.post(
      "/register",
      this.validationMiddleware.validateBody(RegisterDTO),
      this.authController.register,
    );
    this.router.post(
      "/register-admin",
      this.validationMiddleware.validateBody(RegisterAdminDTO),
      this.authController.registerAdmin,
    );
    this.router.post(
      "/login",
      this.validationMiddleware.validateBody(LoginDTO),
      this.authController.login,
    );

    this.router.post(
      "/forgot-password",
      this.validationMiddleware.validateBody(ForgotPasswordDTO),
      this.authController.forgotPassword,
    );

    this.router.post(
      "/reset-password",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_RESET!),
      this.validationMiddleware.validateBody(ResetPasswordDTO),
      this.authController.resetPassword,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
