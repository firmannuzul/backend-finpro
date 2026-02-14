import { Request, Response, NextFunction } from "express";
import { ApplicationService } from "./application.service.js";

export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  getJobApplicants = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const jobId = Number(req.params.jobId);
      const userId = Number(res.locals.user.id); // ID user yang sedang login

      const result = await this.applicationService.getApplicantsByJobId(
        jobId,
        userId,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
