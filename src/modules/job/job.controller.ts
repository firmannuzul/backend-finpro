import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { ApiError } from "../../utils/api-error.js";
import { GetJobsDTO } from "../pagination/dto/get-jobs.dto.js";
import { JobService } from "./job.service.js";

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

  getJobs = async (req: Request, res: Response) => {
    const query = plainToInstance(GetJobsDTO, req.query);
    const result = await this.jobService.getJobs(query);
    res.status(200).send(result);
  };

  getBlogBySlug = async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await this.jobService.getJobBySlug(slug);
    res.status(200).send(result);
  };
}
