import { IsString } from "class-validator";

export class SetTemplateDto {
  @IsString()
  templateId!: string;
}
