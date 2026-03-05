import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { PaginationQueryParams } from "../pagination/dto/pagination.dto.js";
import { ApplyJobDTO } from "./dto/apply-job.dto.js";

export class ApplicantService {
  constructor(
    private prisma: PrismaClient,
    private cloudinaryService: CloudinaryService,
  ) {}

  applyJob = async (
    body: ApplyJobDTO,
    cvFilePath: Express.Multer.File,
    userId: string,
  ) => {
    const { secure_url } = await this.cloudinaryService.upload(cvFilePath);

    const jobPostingIdNum = Number(body.jobPostingId);
    const userIdNum = Number(userId);

    if (isNaN(jobPostingIdNum)) {
      throw new ApiError("Invalid jobPostingId", 400);
    }

    if (isNaN(userIdNum)) {
      throw new ApiError("Invalid userId", 400);
    }
    const jobPosting = await this.prisma.jobPosting.findUnique({
      where: { id: jobPostingIdNum },
      select: { companyId: true },
    });

    if (!jobPosting) {
      throw new ApiError("Job posting not found", 404);
    }

    const apply = await this.prisma.application.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        phoneNumber: body.phoneNumber,
        address: body.address,
        lastEducation: body.lastEducation,
        cvFilePath: secure_url,
        expectedSalary: body.expectedSalary,

        jobPostingId: jobPostingIdNum,
        userId: userIdNum,
        companyId: jobPosting.companyId,
      },
    });
    return { message: " apply job success", data: apply };
  };

  getAppliedMe1 = async (userId: number, query: PaginationQueryParams) => {
    const { page, take, sortBy, sortOrder } = query;

    const application = await this.prisma.application.findMany({
      where: { userId },
      take: take,
      skip: (page - 1) * take,
      include: { jobPosting: true, company: true },
      orderBy: {
        appliedAt: "desc",
      },
    });
    const total = await this.prisma.application.count({
      where: { userId },
    });
    if (application.length === 0) {
      throw new ApiError("Application not found", 404);
    }

    return {
      data: application,
      meta: { page, total, take },
    };
  };
}
