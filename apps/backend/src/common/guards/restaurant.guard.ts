import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

import type { AuthenticatedRequest } from "../interfaces/authenticated-request.interface";

@Injectable()
export class RestaurantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Authentication required.");
    }

    if (user.role === "superadmin") {
      return true;
    }

    const req = request as any;
    const restaurantId =
      req.params?.restaurantId ??
      req.body?.restaurantId ??
      req.query?.restaurantId;

    if (!restaurantId) {
      throw new ForbiddenException("Restaurant scope is required.");
    }

    if (user.restaurantId !== restaurantId) {
      throw new ForbiddenException("You do not have access to this restaurant.");
    }

    return true;
  }
}
