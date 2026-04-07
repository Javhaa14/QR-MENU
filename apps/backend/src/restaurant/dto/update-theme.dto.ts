import {
  IsBoolean,
  IsHexColor,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

import type { ThemeConfig, ThemeRadius } from "@qr-menu/shared-types";

class ThemeComponentsDto {
  @IsString()
  hero!: string;

  @IsString()
  categoryNav!: string;

  @IsString()
  itemCard!: string;

  @IsString()
  categoryHeader!: string;

  @IsString()
  footer!: string;
}

export class UpdateThemeDto {
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

  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;

  @IsOptional()
  @IsBoolean()
  showImages?: boolean;

  @IsOptional()
  @IsString()
  heroImage?: string;

  @ValidateNested()
  @Type(() => ThemeComponentsDto)
  components!: ThemeComponentsDto;
}
