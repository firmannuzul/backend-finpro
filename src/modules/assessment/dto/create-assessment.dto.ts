import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from "class-validator";

// 1. Validasi Level Terbawah: Opsi Jawaban
export class CreateOptionDTO {
  @IsNotEmpty()
  @IsString()
  optionText!: string;

  @IsNotEmpty()
  @IsBoolean()
  isCorrect!: boolean;
}

// 2. Validasi Level Menengah: Pertanyaan
export class CreateQuestionDTO {
  @IsNotEmpty()
  @IsString()
  questionText!: string;

  @IsArray()
  @ArrayMinSize(2) // Minimal 2 pilihan ganda
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDTO)
  options!: CreateOptionDTO[];
}

// 3. Validasi Level Teratas: Payload Utama
export class CreateAssessmentDTO {
  @IsNotEmpty()
  @IsInt()
  jobId!: number;

  @IsArray()
  @ArrayMinSize(25, { message: "Assessment harus memiliki minimal 25 soal" })
  @ArrayMaxSize(25, { message: "Assessment tidak boleh lebih dari 25 soal" })
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDTO)
  questions!: CreateQuestionDTO[];
}
