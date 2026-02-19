import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
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

    const apply = await this.prisma.application.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        phoneNumber: body.phoneNumber,
        address: body.address,
        lastEducation: body.lastEducation,
        cvFilePath: secure_url,

        jobPostingId: jobPostingIdNum,
        userId: userIdNum,
      },
    });
    return { message: " apply job success", data: apply };
  };
}
