import { IsArray, IsString } from "class-validator";

export class UpdateTablesDto {
  @IsArray()
  @IsString({ each: true })
  tables!: string[];
}
