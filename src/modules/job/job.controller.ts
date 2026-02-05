import { Request, Response } from "express";
import { JobService } from "./job.service.js";
import { ApiError } from "../../utils/api-error.js";

export class JobController {
  constructor(private jobService: JobService) {}

  createJob = async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnail = files.thumbnail?.[0];
    if (!thumbnail) throw new ApiError("Thumbnail is required", 400);

    const authCompanyId = Number(res.locals.user.id);

    const result = await this.jobService.createJob(
      req.body,
      thumbnail,
      authCompanyId,
    );
    res.status(200).send(result);
  };
}
