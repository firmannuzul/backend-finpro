import { Router } from "express";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AuthController } from "./auth.controller.js";
import { RegisterDTO } from "./dto/register.dto.js";
import { LoginDTO } from "./dto/login.dto.js";

export class AuthRouter {
  private router: Router;

  constructor(
    private authController: AuthController,
    private validationMiddleware: ValidationMiddleware,
  ) {
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    this.router.post(
      "/register",
      this.validationMiddleware.validateBody(RegisterDTO),
      this.authController.register,
    );
    this.router.post(
      "/login",
      this.validationMiddleware.validateBody(LoginDTO),
      this.authController.login,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
