import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class CreateRestaurantDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsIn(["free", "pro"])
  plan!: "free" | "pro";

  @IsOptional()
  @IsString()
  logo?: string;
}
