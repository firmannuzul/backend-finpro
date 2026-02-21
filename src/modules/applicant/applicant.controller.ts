import { Request, Response } from "express";
import { ApplicantService } from "./applicant.service.js";
import { ApiError } from "../../utils/api-error.js";

export class ApplicantController {
  constructor(private applicantService: ApplicantService) {}

  applyJob = async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const cvFilePath = files.cvFilePath?.[0];
    if (!cvFilePath) throw new ApiError("CV/Resume file is required", 400);

    const userId = res.locals.user?.id;

    if (!userId) {
      throw new ApiError("Unauthorized", 401);
    }

    const result = await this.applicantService.applyJob(
      req.body,
      cvFilePath,
      userId,
    );
    res.status(200).send(result);
  };

  getApplies = async (req: Request, res: Response) => {
    const result = await this.applicantService.getApplies();
    return res.status(200).send(result);
  };

  getApplied = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.applicantService.getApplied(id);
    return res.status(200).send(result);
  };

  getAppliedMe = async (req: Request, res: Response) => {
    const user = res.locals.user;

    const result = await this.applicantService.getAppliedMe(user.id);

    return res.status(200).send(result);
  };
}
