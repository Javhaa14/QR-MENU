import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";
import type { BrandConfig, Template as ITemplate } from "@qr-menu/shared-types";

@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class Template implements ITemplate {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  thumbnail!: string;

  @Prop({ trim: true, default: "" })
  description!: string;

  @Prop({
    type: raw({
      hero: { type: String, required: true },
      categoryNav: { type: String, required: true },
      itemCard: { type: String, required: true },
      categoryHeader: { type: String, required: true },
      footer: { type: String, required: true },
    }),
    required: true,
  })
  slotConfig!: Record<string, string>;

  @Prop({
    type: raw({
      primary: { type: String, required: true },
      bg: { type: String, required: true },
      text: { type: String, required: true },
      accent: { type: String, required: true },
      font: { type: String, required: true },
      borderRadius: { type: String, required: true },
      darkMode: { type: Boolean, default: false },
      showImages: { type: Boolean, default: true },
      heroImage: { type: String, default: "" },
    }),
    required: true,
  })
  defaultBrand!: BrandConfig;

  @Prop({ default: true })
  active!: boolean;
}

export type TemplateDocument = HydratedDocument<Template>;
export const TemplateSchema = SchemaFactory.createForClass(Template);
