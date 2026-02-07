import { Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { generateSlug } from "../../utils/generate-slug.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { GetJobsDTO } from "../pagination/dto/get-jobs.dto.js";
import { CreateJobDTO } from "./dto/create-job.dto.js";

export class JobService {
  constructor(
    private prisma: PrismaClient,
    private cloudinaryService: CloudinaryService,
  ) {}

  createJob = async (
    body: CreateJobDTO,
    thumbnail: Express.Multer.File,
    authUserId: number,
  ) => {
    const { secure_url } = await this.cloudinaryService.upload(thumbnail);

    const slug = generateSlug(body.title);

    await this.prisma.jobPosting.create({
      data: {
        ...body,
        companyId: parseInt(body.companyId),
        salaryMin: parseInt(body.salaryMin),
        salaryMax: parseInt(body.salaryMax),
        deadlineAt: new Date(body.deadlineAt),
        slug: slug,
        thumbnail: secure_url,
      },
    });

    return { message: " create job success" };
  };

  getJobs = async (query: GetJobsDTO) => {
    const { page, take, sortBy, sortOrder, search } = query;

    const whereClause: Prisma.JobPostingWhereInput = {};

    if (search) {
      // whereClause.title = { contains: search, mode: "insensitive" };
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          location: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const jobs = await this.prisma.jobPosting.findMany({
      where: whereClause,
      take: take,
      skip: (page - 1) * take,
      orderBy: { [sortBy]: sortOrder },
      include: { company: { select: { companyName: true } } },
      // include: { company: { select: { companyName: true, location: true, industry: true, websiteUrl: true } } },
      // include: { company: true},
    });

    const total = await this.prisma.jobPosting.count({ where: whereClause });
    return {
      data: jobs,
      meta: { page, take, total },
    };
  };

  getJobBySlug = async (slug: string) => {
    const job = await this.prisma.jobPosting.findFirst({
      where: { slug },
      include: { company: { select: { companyName: true } } },
    });

    if (!job) {
      throw new ApiError("Job not found", 404);
    }

    return job;
  };
}
