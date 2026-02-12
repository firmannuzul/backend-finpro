// src/modules/assessment/assessment.controller.ts
import { Request, Response } from "express";
import { AssessmentService } from "./assessment.service.js";

export class AssessmentController {
  constructor(private assessmentService: AssessmentService) {}

  getTest = async (req: Request, res: Response) => {
    const jobId = Number(req.params.jobId);
    const result = await this.assessmentService.getQuestionsByJobId(jobId);
    res.status(200).send({ success: true, data: result });
  };

  submitTest = async (req: Request, res: Response) => {
    const authUserId = Number(res.locals.user.id);
    const result = await this.assessmentService.submitAssessment(
      req.body,
      authUserId,
    );
    res.status(200).send({ success: true, data: result });
  };

  createTest = async (req: Request, res: Response) => {
    // Ambil ID user dari token
    const authUserId = Number(res.locals.user.id);

    const result = await this.assessmentService.createAssessment(
      req.body,
      authUserId,
    );

    res.status(201).send({ success: true, data: result });
  };
}
