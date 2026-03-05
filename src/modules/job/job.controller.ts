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

    const authUserId = Number(res.locals.user.id);

    const result = await this.jobService.createJob(
      req.body,
      thumbnail,
      authUserId,
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

  getCompanyJobs = async (req: Request, res: Response) => {
    const companyId = Number(req.params.id);
    const page = Number(req.query.page) || 1;
    const take = Number(req.query.take) || 5;

    if (!companyId) {
      res.status(400);
      throw new ApiError("Invalid company id", 400);
    }

    const result = await this.jobService.getCompanyJobs(companyId, page, take);

    res.status(200).send(result);
  };

  getNearbyJobs = async (req: Request, res: Response) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius) || 10;
    const page = Number(req.query.page) || 1;
    const take = Number(req.query.take) || 10;

    if (!lat || !lng) {
      throw new ApiError("Latitude and longitude are required", 400);
    }

    const result = await this.jobService.getNearbyJobs(
      lat,
      lng,
      radius,
      page,
      take,
    );

    res.status(200).json(result);
  };
}
