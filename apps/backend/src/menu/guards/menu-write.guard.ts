import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, isValidObjectId } from "mongoose";

import { Restaurant, type RestaurantDocument } from "../../database/schemas/restaurant.schema";
import type { AuthenticatedRequest } from "../../common/interfaces/authenticated-request.interface";

@Injectable()
export class MenuWriteGuard implements CanActivate {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    if (!isValidObjectId(restaurantId)) {
      throw new NotFoundException("Restaurant not found.");
    }

    const restaurant = await this.restaurantModel
      .findById(restaurantId)
      .select({ restaurantType: 1 })
      .lean();

    if (!restaurant) {
      throw new NotFoundException("Restaurant not found.");
    }

    return true;
  }
}
