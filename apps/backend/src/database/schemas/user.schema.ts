import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";

@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class User {
  @Prop({ required: true, unique: true, index: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, index: true })
  restaurantId!: string;

  @Prop({ enum: ["owner", "staff"], default: "owner" })
  role!: "owner" | "staff";

  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
