import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";

import type { ThemeConfig } from "@qr-menu/shared-types";

import { DEFAULT_THEME_CONFIG } from "./theme.defaults";

@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class Restaurant {
  @Prop({ required: true, unique: true, index: true, trim: true })
  slug!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true, default: "" })
  logo!: string;

  @Prop({
    type: raw({
      _id: false,
      colors: raw({
        primary: { type: String, required: true },
        bg: { type: String, required: true },
        text: { type: String, required: true },
        accent: { type: String, required: true },
      }),
      font: { type: String, required: true },
      borderRadius: { type: String, required: true },
      darkMode: { type: Boolean, default: false },
      showImages: { type: Boolean, default: true },
      heroImage: { type: String, default: "" },
      components: raw({
        hero: { type: String, required: true },
        categoryNav: { type: String, required: true },
        itemCard: { type: String, required: true },
        categoryHeader: { type: String, required: true },
        footer: { type: String, required: true },
      }),
    }),
    required: true,
    default: DEFAULT_THEME_CONFIG,
  })
  themeConfig!: ThemeConfig;

  @Prop({ enum: ["free", "pro"], default: "free" })
  plan!: "free" | "pro";

  @Prop({ default: true })
  isActive!: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export type RestaurantDocument = HydratedDocument<Restaurant>;
export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
