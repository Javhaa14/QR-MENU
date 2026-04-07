import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";

import type { BrandConfig, ThemeConfig } from "@qr-menu/shared-types";

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

  @Prop({ type: String, ref: "Template", index: true })
  templateId?: string;

  @Prop({
    type: raw({
      _id: false,
      primary: { type: String, required: false },
      bg: { type: String, required: false },
      text: { type: String, required: false },
      accent: { type: String, required: false },
      font: { type: String, required: false },
      borderRadius: { type: String, required: false },
      darkMode: { type: Boolean, default: false },
      showImages: { type: Boolean, default: true },
      heroImage: { type: String, default: "" },
    }),
    required: false,
  })
  brandConfig?: BrandConfig;

  @Prop({
    type: raw({
      _id: false,
      primary: { type: String, required: false },
      bg: { type: String, required: false },
      text: { type: String, required: false },
      accent: { type: String, required: false },
      font: { type: String, required: false },
      borderRadius: { type: String, required: false },
      darkMode: { type: Boolean, default: false },
      showImages: { type: Boolean, default: true },
      heroImage: { type: String, default: "" },
      components: raw({
        hero: { type: String, required: false },
        categoryNav: { type: String, required: false },
        itemCard: { type: String, required: false },
        categoryHeader: { type: String, required: false },
        footer: { type: String, required: false },
      }),
    }),
    required: true,
    default: DEFAULT_THEME_CONFIG,
  })
  themeConfig!: ThemeConfig;

  @Prop({ enum: ["free", "pro"], default: "free" })
  plan!: "free" | "pro";

  @Prop({ enum: ["menu_only", "order_enabled"], default: "menu_only" })
  restaurantType!: "menu_only" | "order_enabled";

  @Prop({ type: [String], default: [] })
  tables!: string[];

  @Prop({ default: true })
  isActive!: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export type RestaurantDocument = HydratedDocument<Restaurant>;
export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
