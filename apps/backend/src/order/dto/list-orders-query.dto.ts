import { IsIn, IsOptional } from "class-validator";

export class ListOrdersQueryDto {
  @IsOptional()
  @IsIn(["pending", "preparing", "ready", "completed", "cancelled"])
  status?: "pending" | "preparing" | "ready" | "completed" | "cancelled";
}
