import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";

@Schema({ _id: false, versionKey: false })
export class OrderItemEntity {
  @Prop({ required: true })
  menuItemId!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ trim: true, default: "" })
  note!: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItemEntity);

@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class Order {
  @Prop({ required: true, index: true })
  restaurantId!: string;

  @Prop({ trim: true, default: "" })
  tableNumber!: string;

  @Prop({ type: [OrderItemSchema], required: true })
  items!: OrderItemEntity[];

  @Prop({
    required: true,
    enum: ["pending", "preparing", "ready", "completed", "cancelled"],
    default: "pending",
    index: true,
  })
  status!: "pending" | "preparing" | "ready" | "completed" | "cancelled";

  @Prop({ required: true, min: 0 })
  totalPrice!: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ createdAt: -1 });
