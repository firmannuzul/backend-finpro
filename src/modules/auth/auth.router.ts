import { Router } from "express";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AuthController } from "./auth.controller.js";
import { RegisterDTO } from "./dto/register.dto.js";

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
  };

  getRouter = () => {
    return this.router;
  };
}
