import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument, Types } from "mongoose";

@Schema({ _id: true, versionKey: false })
export class MenuItemEntity {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true, default: "" })
  description!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ required: true, trim: true, default: "MNT" })
  currency!: string;

  @Prop({ trim: true, default: "" })
  image!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: [String], default: [] })
  allergens!: string[];

  @Prop({ default: true })
  isAvailable!: boolean;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItemEntity);

@Schema({ _id: true, versionKey: false })
export class CategoryEntity {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: 0 })
  position!: number;

  @Prop({ type: [MenuItemSchema], default: [] })
  items!: Types.DocumentArray<MenuItemEntity>;
}

export const CategorySchema = SchemaFactory.createForClass(CategoryEntity);

@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class Menu {
  @Prop({ required: true, index: true })
  restaurantId!: string;

  @Prop({ default: false })
  isActive!: boolean;

  @Prop({ type: [CategorySchema], default: [] })
  categories!: Types.DocumentArray<CategoryEntity>;

  createdAt?: Date;
  updatedAt?: Date;
}

export type MenuDocument = HydratedDocument<Menu>;
export const MenuSchema = SchemaFactory.createForClass(Menu);
