import { IsIn } from "class-validator";

export class UpdateOrderStatusDto {
  @IsIn(["preparing", "ready", "completed", "cancelled"])
  status!: "preparing" | "ready" | "completed" | "cancelled";
}
