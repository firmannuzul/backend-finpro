import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class ApplicationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Mengambil daftar pelamar untuk lowongan tertentu
   * Diurutkan berdasarkan Skor Tertinggi -> Tanggal Lamar Terbaru
   */
  getApplicantsByJobId = async (jobId: number, companyUserId: number) => {
    // 1. Validasi: Pastikan Job tersebut milik Company yang sedang login
    const job = await this.prisma.jobPosting.findFirst({
      where: {
        id: jobId,
        // Asumsi: JobPosting terhubung ke CompanyProfile, dan CompanyProfile terhubung ke User
        // Sesuaikan relasi ini dengan schema database
        company: { userId: companyUserId },
      },
    });

    if (!job) {
      throw new ApiError("Lowongan tidak ditemukan atau akses ditolak", 403);
    }

    // 2. Ambil data pelamar
    const applicants = await this.prisma.application.findMany({
      where: { jobPostingId: jobId },
      include: {
        applicant: {
          select: {
            id: true,
            email: true,
            applicantProfile: {
              select: {
                name: true,
                photoPath: true, // Asumsi field avatar ada di sini
              },
            },
          },
        },
      },
      orderBy: [
        { preselectionScore: "desc" }, // Prioritas 1: Skor Tinggi
        { appliedAt: "desc" }, // Prioritas 2: Paling baru melamar
      ],
    });

    return applicants;
  };
}
