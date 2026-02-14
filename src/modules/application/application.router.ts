import { Router } from "express";
import { ApplicationController } from "./application.controller.js";
import { JwtMiddleware } from "../../middlewares/jwt.middleware.js";

export class ApplicationRouter {
  private router: Router;
  private jwtMiddleware: JwtMiddleware;

  constructor(private applicationController: ApplicationController) {
    this.router = Router();
    this.jwtMiddleware = new JwtMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Route: GET /api/applications/job/:jobId
    this.router.get(
      "/job/:jobId",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.applicationController.getJobApplicants,
    );
  }

  getRouter() {
    return this.router;
  }
}
