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

  @Prop({
    type: String,
    default: null,
    index: true,
    required(this: User) {
      return this.role === "restaurant_admin";
    },
  })
  restaurantId!: string | null;

  @Prop({
    enum: ["superadmin", "restaurant_admin"],
    default: "restaurant_admin",
  })
  role!: "superadmin" | "restaurant_admin";

  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
