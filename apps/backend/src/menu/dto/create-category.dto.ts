import { IsInt, IsOptional, IsString, MinLength, Min } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
