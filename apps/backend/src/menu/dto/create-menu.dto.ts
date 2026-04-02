import { IsString, MinLength } from "class-validator";

export class CreateMenuDto {
  @IsString()
  @MinLength(2)
  name!: string;
}
