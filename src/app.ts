import cors from "cors";
import express, { Express } from "express";
import "reflect-metadata";
import { PORT } from "./config/env.js";
import { loggerHttp } from "./lib/logger-http.js";
import { prisma } from "./lib/prisma.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { ValidationMiddleware } from "./middlewares/validation.middleware.js";
import { SampleController } from "./modules/sample/sample.controller.js";
import { SampleRouter } from "./modules/sample/sample.router.js";
import { SampleService } from "./modules/sample/sample.service.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { AuthRouter } from "./modules/auth/auth.router.js";

export class App {
  app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.registerModules();
    this.handleError();
  }

  private configure() {
    this.app.use(cors());
    this.app.use(loggerHttp);
    this.app.use(express.json());
  }

  private registerModules() {
    // shared dependency
    const prismaClient = prisma;

    // services
    const sampleService = new SampleService(prismaClient);
    const authService = new AuthService(prismaClient);

    // controllers
    const sampleController = new SampleController(sampleService);
    const authController = new AuthController(authService);

    // middlewares
    const validationMiddleware = new ValidationMiddleware();

    // routers
    const sampleRouter = new SampleRouter(
      sampleController,
      validationMiddleware,
    );

    const authRouter = new AuthRouter(authController, validationMiddleware);

    this.app.use("/samples", sampleRouter.getRouter());
    this.app.use("/auth", authRouter.getRouter());
  }

  private handleError() {
    this.app.use(errorMiddleware);
  }

  public start() {
    this.app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  }
}
