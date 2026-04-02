import type { UserRole } from "@qr-menu/shared-types";

export interface RequestUser {
  userId: string;
  email: string;
  restaurantId: string;
  role: UserRole;
}
