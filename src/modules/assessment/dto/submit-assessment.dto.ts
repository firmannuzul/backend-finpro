import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, ValidateNested } from "class-validator";

// 1. DTO Kecil untuk setiap butir jawaban
class AssessmentAnswerItem {
  @IsNotEmpty()
  @IsInt()
  questionId!: number;

  @IsNotEmpty()
  @IsInt()
  selectedOptionId!: number;
}

// 2. DTO Utama untuk Submission
export class SubmitAssessmentDTO {
  @IsNotEmpty()
  @IsInt()
  // Pastikan frontend mengirim job_id sebagai number, atau gunakan @Type(() => Number) jika string
  jobId!: number;

  @IsArray()
  @ValidateNested({ each: true }) // Validasi setiap item di dalam array
  @Type(() => AssessmentAnswerItem) // Wajib ada agar class-validator mengenali struktur object di dalamnya
  answers!: AssessmentAnswerItem[];
}
