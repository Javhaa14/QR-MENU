import type { UserRole } from "@qr-menu/shared-types";

export interface JwtPayload {
  sub: string;
  email: string;
  restaurantId: string;
  role: UserRole;
}
