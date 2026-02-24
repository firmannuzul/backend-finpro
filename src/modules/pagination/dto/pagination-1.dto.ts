import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, isString } from "class-validator";

export class PaginationQueryParams1 {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  take: number = 3;

  @IsOptional()
  @IsString()
  sortOrder: string = "desc";

  @IsOptional()
  @IsString()
  sortBy: string = "postedAt";
}
