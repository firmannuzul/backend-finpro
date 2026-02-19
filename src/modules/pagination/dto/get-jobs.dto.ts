import { IsIn, IsOptional, IsString } from "class-validator";
import { PaginationQueryParams } from "./pagination.dto.js";

export class GetJobsDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(["all", "week", "month", "custom"])
  timeRange?: "all" | "week" | "month" | "custom";

  @IsOptional()
  @IsIn(["latest", "oldest", "popular"])
  sort?: "latest" | "oldest" | "popular";
}
