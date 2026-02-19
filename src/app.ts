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
import { JobService } from "./modules/job/job.service.js";
import { JobController } from "./modules/job/job.controller.js";
import { CloudinaryService } from "./modules/cloudinary/cloudinary.service.js";
import { JobRouter } from "./modules/job/job.router.js";
import { AssessmentService } from "./modules/assessment/assessment.service.js";
import { AssessmentController } from "./modules/assessment/assessment.controller.js";
import { AssessmentRouter } from "./modules/assessment/assessment.router.js";
import { ApplicationService } from "./modules/application/application.service.js";
import { ApplicationController } from "./modules/application/application.controller.js";
import { ApplicationRouter } from "./modules/application/application.router.js";
import { UserService } from "./modules/user/user.service.js";
import { UserController } from "./modules/user/user.controller.js";
import { UserRouter } from "./modules/user/user.router.js";
import { JwtMiddleware } from "./middlewares/jwt.middleware.js";
import { UploaderMiddleware } from "./middlewares/uploader.middleware.js";
import { ApplicantService } from "./modules/applicant/applicant.service.js";
import { ApplicantController } from "./modules/applicant/applicant.controller.js";
import { ApplicantRouter } from "./modules/applicant/applicant.router.js";

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
    const cloudinaryService = new CloudinaryService();

    // services
    const sampleService = new SampleService(prismaClient);
    const authService = new AuthService(prismaClient);
    const jobService = new JobService(prismaClient, cloudinaryService);
    const assessmentService = new AssessmentService(prisma);
    const applicationService = new ApplicationService(prisma);
    const userService = new UserService(prismaClient, cloudinaryService);
    const applicantService = new ApplicantService(
      prismaClient,
      cloudinaryService,
    );

    // controllers
    const sampleController = new SampleController(sampleService);
    const authController = new AuthController(authService);
    const jobController = new JobController(jobService);
    const assessmentController = new AssessmentController(assessmentService);
    const applicationController = new ApplicationController(applicationService);
    const userController = new UserController(userService);
    const applicantController = new ApplicantController(applicantService);

    // middlewares
    const validationMiddleware = new ValidationMiddleware();

    //jwt
    const jwtMiddleware = new JwtMiddleware();

    //uploader
    const uploaderMiddleware = new UploaderMiddleware();

    // routers
    const sampleRouter = new SampleRouter(
      sampleController,
      validationMiddleware,
    );

    const authRouter = new AuthRouter(authController, validationMiddleware);

    const jobRouter = new JobRouter(jobController, validationMiddleware);

    const assessmentRouter = new AssessmentRouter(
      assessmentController,
      validationMiddleware,
    );

    const applicationRouter = new ApplicationRouter(applicationController);
    const userRouter = new UserRouter(
      userController,
      validationMiddleware,
      jwtMiddleware,
      uploaderMiddleware,
    );

    const applicantRouter = new ApplicantRouter(
      applicantController,
      validationMiddleware,
      jwtMiddleware,
      uploaderMiddleware,
    );

    this.app.use("/samples", sampleRouter.getRouter());
    this.app.use("/auth", authRouter.getRouter());
    this.app.use("/job", jobRouter.getRouter());
    this.app.use("/assessment", assessmentRouter.getRouter());
    this.app.use("/applications", applicationRouter.getRouter());
    this.app.use("/user", userRouter.getRouter());
    this.app.use("/applicant", applicantRouter.getRouter());
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
