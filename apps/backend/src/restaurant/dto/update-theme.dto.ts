import {
  IsBoolean,
  IsHexColor,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

import type { ThemeConfig } from "@qr-menu/shared-types";

class ThemeColorsDto {
  @IsHexColor()
  primary!: string;

  @IsHexColor()
  bg!: string;

  @IsHexColor()
  text!: string;

  @IsHexColor()
  accent!: string;
}

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
  @ValidateNested()
  @Type(() => ThemeColorsDto)
  colors!: ThemeColorsDto;

  @IsString()
  font!: string;

  @IsIn(["none", "sm", "md", "lg", "full"])
  borderRadius!: ThemeConfig["borderRadius"];

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
