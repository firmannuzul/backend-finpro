import { Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { calculateDistanceKm } from "../../utils/distance.js";
import { generateSlug } from "../../utils/generate-slug.js";
import { geocodeLocation } from "../../utils/geocode.js";
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

    const geo = await geocodeLocation(body.location);

    if (!geo) {
      throw new ApiError("Location not found", 400);
    }

    await this.prisma.jobPosting.create({
      data: {
        ...body,
        companyId: parseInt(body.companyId),
        salaryMin: parseInt(body.salaryMin),
        salaryMax: parseInt(body.salaryMax),
        deadlineAt: new Date(body.deadlineAt),
        experience: body.experience,
        slug: slug,
        thumbnail: secure_url,

        latitude: geo.lat,
        longitude: geo.lng,
      },
    });

    return { message: " create job success" };
  };

  getJobs = async (query: GetJobsDTO) => {
    const {
      page,
      take,
      sortBy,
      sortOrder,
      search,
      location,
      category,
      timeRange,
      sort,
      from,
      to,
    } = query;

    /* 🛡️ Validations */
    if (page < 1) throw new ApiError("Page must be greater than 0", 400);
    if (take < 1 || take > 100)
      throw new ApiError("Take must be between 1 and 100", 400);

    const validSortBy = ["createdAt", "postedAt", "title", "views"];
    if (sortBy && !validSortBy.includes(sortBy))
      throw new ApiError(
        `Invalid sortBy field. Allowed: ${validSortBy.join(", ")}`,
        400,
      );

    const validSortOrder = ["asc", "desc"];
    if (sortOrder && !validSortOrder.includes(sortOrder))
      throw new ApiError("sortOrder must be 'asc' or 'desc'", 400);

    const validTimeRange = ["all", "week", "month", "custom"];
    if (timeRange && !validTimeRange.includes(timeRange))
      throw new ApiError(
        `Invalid timeRange. Allowed: ${validTimeRange.join(", ")}`,
        400,
      );

    if (timeRange === "custom") {
      if (!from || !to)
        throw new ApiError(
          "from and to are required when timeRange is 'custom'",
          400,
        );
      if (new Date(from) > new Date(to))
        throw new ApiError("from date must be before to date", 400);
    }

    const whereClause: Prisma.JobPostingWhereInput = {};

    /* 🔍 Text search */

    if (search) {
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
        {
          company: {
            companyName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          category: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    /* 📍 Location filter */
    if (location) {
      whereClause.location = location;
    }

    /* 💼 Category filter */
    if (category) {
      whereClause.category = category;
    }

    /* ⏱ Time range filter */
    if (timeRange && timeRange !== "all") {
      const now = new Date();
      let fromDate: Date | undefined;

      if (timeRange === "week") {
        fromDate = new Date(now.setDate(now.getDate() - 7));
      }

      if (timeRange === "month") {
        fromDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      if (fromDate) {
        whereClause.postedAt = {
          gte: fromDate,
        };
      }

      if (timeRange === "custom" && from && to) {
        whereClause.postedAt = {
          gte: new Date(from),
          lte: new Date(to),
        };
      }
    }

    /* 🔃 Sorting (safe mapping) */
    const sortMap: Record<string, any> = {
      latest: { createdAt: "desc" },
      oldest: { createdAt: "asc" },
      popular: { views: "desc" }, // kalau ada field views
    };

    const jobs = await this.prisma.jobPosting.findMany({
      where: whereClause,
      take: take,
      skip: (page - 1) * take,
      orderBy: { [sortBy]: sortOrder },
      include: { company: { select: { companyName: true } } },
      // include: { company: { select: { companyName: true, location: true, industry: true, websiteUrl: true } } },
      // include: { company: true},
    });

    if (!jobs.length) throw new ApiError("No jobs found", 404);

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

  getCompanyJobs = async (
    companyId: number,
    page: number = 1,
    take: number = 5,
  ) => {
    if (!companyId) throw new ApiError("Company ID is required", 400);
    if (page < 1) throw new ApiError("Page must be greater than 0", 400);
    if (take < 1 || take > 100)
      throw new ApiError("Take must be between 1 and 100", 400);

    const company = await this.prisma.companyProfile.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new ApiError("Company not found", 404);

    const jobs = await this.prisma.jobPosting.findMany({
      where: {
        companyId,
        isPublished: true,
      },
      take,
      skip: (page - 1) * take,
      orderBy: {
        postedAt: "desc",
      },
      include: {
        company: {
          select: {
            companyName: true,
          },
        },
      },
    });

    if (!jobs.length) throw new ApiError("No jobs found for this company", 404);

    const total = await this.prisma.jobPosting.count({
      where: {
        companyId,
        isPublished: true,
      },
    });

    return {
      data: jobs,
      meta: {
        page,
        take,
        total,
      },
    };
  };

  getNearbyJobs = async (
    lat: number,
    lng: number,
    radius: number = 10,
    page: number = 1,
    take: number = 10,
  ) => {
    /* 🛡️ Validations */
    if (lat === undefined || lng === undefined)
      throw new ApiError("Latitude and longitude are required", 400);
    if (lat < -90 || lat > 90)
      throw new ApiError("Latitude must be between -90 and 90", 400);
    if (lng < -180 || lng > 180)
      throw new ApiError("Longitude must be between -180 and 180", 400);
    if (radius < 1 || radius > 500)
      throw new ApiError("Radius must be between 1 and 500 km", 400);
    if (page < 1) throw new ApiError("Page must be greater than 0", 400);
    if (take < 1 || take > 100)
      throw new ApiError("Take must be between 1 and 100", 400);

    const jobs = await this.prisma.jobPosting.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        isPublished: true,
      },
      include: {
        company: {
          select: {
            companyName: true,
            location: true,
            industry: true,
          },
        },
      },
    });

    const jobsWithDistance = jobs
      .map((job) => {
        const distance = calculateDistanceKm(
          lat,
          lng,
          job.latitude!,
          job.longitude!,
        );

        return {
          ...job,
          distance,
        };
      })
      .filter((job) => job.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    if (!jobsWithDistance.length)
      throw new ApiError("No jobs found within the specified radius", 404);

    const total = jobsWithDistance.length;

    const paginated = jobsWithDistance.slice((page - 1) * take, page * take);

    if (!paginated.length)
      throw new ApiError("Page exceeds total available data", 400);

    return {
      data: paginated,
      meta: {
        page,
        take,
        total,
      },
    };
  };
}
