import { Router } from "express";
import { JwtMiddleware } from "../../middlewares/jwt.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AssessmentController } from "./assessment.controller.js";
import { SubmitAssessmentDTO } from "./dto/submit-assessment.dto.js";
import { CreateAssessmentDTO } from "./dto/create-assessment.dto.js";

export class AssessmentRouter {
  private router: Router;
  private jwtMiddleware: JwtMiddleware;

  constructor(
    private assessmentController: AssessmentController,
    private validationMiddleware: ValidationMiddleware,
  ) {
    this.router = Router();
    this.jwtMiddleware = new JwtMiddleware();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    // 1. Route untuk mengambil soal (GET)
    // Tidak perlu token jika publik, atau tambahkan jika hanya untuk user login
    this.router.get("/job/:jobId", this.assessmentController.getTest);

    // 2. Route untuk submit jawaban (POST)
    this.router.post(
      "/submit",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.validationMiddleware.validateBody(SubmitAssessmentDTO),
      this.assessmentController.submitTest,
    );

    this.router.post(
      "/create",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      // Nanti Tambahkan middleware this.authMiddleware.checkRole("COMPANY")
      this.validationMiddleware.validateBody(CreateAssessmentDTO),
      this.assessmentController.createTest,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
