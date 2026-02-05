import { PrismaClient } from "../../../generated/prisma/client.js";
import { generateSlug } from "../../utils/generate-slug.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
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
}
