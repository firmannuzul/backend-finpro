import { IsOptional, IsString } from "class-validator";
import { PaginationQueryParams } from "./pagination.dto.js";

export class GetJobsDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  search?: string;
}
