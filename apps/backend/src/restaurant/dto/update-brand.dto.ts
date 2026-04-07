import {
  IsBoolean,
  IsHexColor,
  IsIn,
  IsOptional,
  IsString,
} from "class-validator";
import type { BrandConfig, ThemeRadius } from "@qr-menu/shared-types";

export class UpdateBrandDto implements BrandConfig {
  @IsHexColor()
  primary!: string;

  @IsHexColor()
  bg!: string;

  @IsHexColor()
  text!: string;

  @IsHexColor()
  accent!: string;

  @IsString()
  font!: string;

  @IsIn(["none", "sm", "md", "lg", "full"])
  borderRadius!: ThemeRadius;

  @IsBoolean()
  darkMode!: boolean;

  @IsOptional()
  @IsBoolean()
  showImages?: boolean;

  @IsOptional()
  @IsString()
  heroImage?: string;
}
