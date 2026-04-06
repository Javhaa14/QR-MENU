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
  @IsIn(["menu_only", "order_enabled"])
  restaurantType?: "menu_only" | "order_enabled";

  @IsOptional()
  @IsString()
  logo?: string;
}
