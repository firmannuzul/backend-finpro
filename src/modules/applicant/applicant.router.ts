import { Router } from "express";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { ApplicantController } from "./applicant.controller.js";
import { ApplyJobDTO } from "./dto/apply-job.dto.js";
import { JwtMiddleware } from "../../middlewares/jwt.middleware.js";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware.js";

export class ApplicantRouter {
  private router: Router;

  constructor(
    private applicantController: ApplicantController,
    private validationMiddleware: ValidationMiddleware,
    private jwtMiddleware: JwtMiddleware,
    private uploaderMiddleware = new UploaderMiddleware(),
  ) {
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.uploaderMiddleware
        .upload()
        .fields([{ name: "cvFilePath", maxCount: 1 }]),
      this.validationMiddleware.validateBody(ApplyJobDTO),
      this.applicantController.applyJob,
    );
    this.router.get("/", this.applicantController.getApplies);
    this.router.get(
      "/me",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.applicantController.getAppliedMe,
    );
    this.router.get("/:id", this.applicantController.getApplied);
  };

  getRouter = () => {
    return this.router;
  };
}
