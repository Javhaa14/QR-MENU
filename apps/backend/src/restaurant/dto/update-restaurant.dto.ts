import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsIn(["free", "pro"])
  plan?: "free" | "pro";

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
