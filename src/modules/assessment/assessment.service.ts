// src/modules/assessment/assessment.service.ts
import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateAssessmentDTO } from "./dto/create-assessment.dto.js";
import { SubmitAssessmentDTO } from "./dto/submit-assessment.dto.js";

export class AssessmentService {
  constructor(private prisma: PrismaClient) {}

  // Mengambil daftar soal berdasarkan Job ID

  getQuestionsByJobId = async (jobId: number) => {
    // 1. Validasi apakah Job ada dan memiliki fitur pre-selection
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: jobId, hasPreselection: true },
    });

    if (!job) {
      throw new ApiError("Assessment tidak ditemukan untuk pekerjaan ini", 404);
    }

    // 2. Ambil soal beserta opsinya
    // Kita tetap menggunakan 'select' agar isCorrect tidak terkirim ke frontend
    return await this.prisma.preselectionQuestion.findMany({
      where: { jobPostingId: jobId },
      select: {
        id: true,
        questionText: true,
        options: {
          select: {
            id: true,
            optionText: true,
          },
        },
      },
    });
  };

  /**
   * Menghitung nilai hasil tes kandidat
   */
  submitAssessment = async (body: SubmitAssessmentDTO, userId: number) => {
    const { jobId, answers } = body;
    const PASSING_GRADE = 70;

    // 1. Ambil soal dan kunci jawaban
    const questions = await this.prisma.preselectionQuestion.findMany({
      where: { jobPostingId: jobId },
      include: {
        options: {
          where: { isCorrect: true },
          select: { id: true, questionId: true },
        },
      },
    });

    if (questions.length === 0) throw new ApiError("Soal tidak ditemukan", 404);

    // 2. Hitung skor
    let correctCount = 0;
    answers.forEach((userAns) => {
      const question = questions.find((q) => q.id === userAns.questionId);
      const correctAnswerId = question?.options[0]?.id;
      if (correctAnswerId === userAns.selectedOptionId) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);

    // 3. Update preselectionScore di tabel Application
    // Menggunakan updateMany karena untuk mencari berdasarkan kombinasi userId dan jobId
    await this.prisma.application.updateMany({
      where: {
        userId: userId,
        jobPostingId: jobId,
      },
      data: {
        preselectionScore: score,
        status: score < PASSING_GRADE ? "REJECTED" : "PENDING",
        rejectionReason:
          score < PASSING_GRADE
            ? "Tidak lulus passing grade pre-selection test"
            : null,
      },
    });

    return {
      message: "Assessment submitted successfully",
      score,
      totalCorrect: correctCount,
      totalQuestions: questions.length,
      status: score >= PASSING_GRADE ? "PASSED" : "FAILED",
    };
  };

  createAssessment = async (body: CreateAssessmentDTO, userId: number) => {
    const { jobId, questions } = body;

    // 1. Validasi Ownership & Existence
    // Pastikan Job ada DAN milik user (company) yang sedang login
    // Asumsi: Kita cek lewat relasi company -> userId (sesuaikan dengan schema user kamu)
    const job = await this.prisma.jobPosting.findFirst({
      where: {
        id: jobId,
        // Uncomment baris di bawah jika skema CompanyProfile terhubung ke User
        // company: { userId: userId }
      },
    });

    if (!job) {
      throw new ApiError(
        "Pekerjaan tidak ditemukan atau Anda tidak memiliki akses",
        404,
      );
    }

    if (job.hasPreselection) {
      throw new ApiError("Pekerjaan ini sudah memiliki tes pre-selection", 400);
    }

    // 2. Transaction untuk operasi batch
    const result = await this.prisma.$transaction(async (tx) => {
      // A. Set status hasPreselection jadi TRUE
      await tx.jobPosting.update({
        where: { id: jobId },
        data: { hasPreselection: true },
      });

      // B. Loop insert soal & opsi
      // Kita tidak pakai createMany untuk soal karena kita butuh insert opsi (nested write)
      const createdQuestions = [];

      for (const q of questions) {
        // Validasi Logika Bisnis: Pastikan ada minimal 1 kunci jawaban benar
        const hasCorrectAnswer = q.options.some((opt) => opt.isCorrect);
        if (!hasCorrectAnswer) {
          throw new ApiError(
            `Soal "${q.questionText}" tidak memiliki kunci jawaban benar`,
            400,
          );
        }

        const newQuestion = await tx.preselectionQuestion.create({
          data: {
            jobPostingId: jobId,
            questionText: q.questionText,
            options: {
              create: q.options.map((opt) => ({
                optionText: opt.optionText,
                isCorrect: opt.isCorrect,
              })),
            },
          },
          include: { options: true }, // Include untuk return data
        });
        createdQuestions.push(newQuestion);
      }

      return createdQuestions;
    });

    return {
      message: "Berhasil membuat 25 soal pre-selection",
      totalQuestions: result.length,
      jobId,
    };
  };
}

// submitAssessment = async (body: SubmitAssessmentDTO, userId: number) => {
//   const { jobId, answers } = body;

//   // 1. Ambil soal sekaligus ambil standar kelulusan dari JobPosting
//   const jobData = await this.prisma.jobPosting.findUnique({
//     where: { id: jobId },
//     select: { testPassingGrade: true }
//   });

//   const questions = await this.prisma.preselectionQuestion.findMany({
//     where: { jobPostingId: jobId },
//     include: {
//       options: { where: { isCorrect: true }, select: { id: true } },
//     },
//   });

//   if (!jobData || questions.length === 0) throw new ApiError("Data tidak ditemukan", 404);

//   // 2. Hitung skor (sama seperti sebelumnya)
//   let correctCount = 0;
//   answers.forEach((userAns) => {
//     const question = questions.find((q) => q.id === userAns.questionId);
//     if (question?.options[0]?.id === userAns.selectedOptionId) correctCount++;
//   });

//   const score = Math.round((correctCount / questions.length) * 100);

//   // 3. Bandingkan dengan standar manual dari database
//   const passingGrade = jobData.testPassingGrade;
//   const isPassed = score >= passingGrade;

//   // 4. Update ke tabel Application
//   await this.prisma.application.updateMany({
//     where: { userId, jobPostingId: jobId },
//     data: {
//       preselectionScore: score,
//       status: isPassed ? "PENDING" : "REJECTED",
//       rejectionReason: isPassed ? null : `Skor ${score} di bawah standar kelulusan (${passingGrade})`
//     },
//   });

//   return {
//     score,
//     passingGrade, // Tampilkan standar yang berlaku
//     status: isPassed ? "PASSED" : "FAILED"
//   };
// };
