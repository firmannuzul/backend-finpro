import { Router } from "express";
import { JwtMiddleware } from "../../middlewares/jwt.middleware.js";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { CreateJobDTO } from "./dto/create-job.dto.js";
import { JobController } from "./job.controller.js";

export class JobRouter {
  private router: Router;
  jwtMiddleware: JwtMiddleware;
  uploaderMiddleware: UploaderMiddleware;

  constructor(
    private jobController: JobController,
    private validationMiddleware: ValidationMiddleware,
  ) {
    this.router = Router();
    this.jwtMiddleware = new JwtMiddleware();
    this.uploaderMiddleware = new UploaderMiddleware();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.uploaderMiddleware
        .upload()
        .fields([{ name: "thumbnail", maxCount: 1 }]),
      this.validationMiddleware.validateBody(CreateJobDTO),
      this.jobController.createJob,
    );
    this.router.get("/", this.jobController.getJobs);
    this.router.get("/:slug", this.jobController.getBlogBySlug);
  };

  getRouter = () => {
    return this.router;
  };
}
