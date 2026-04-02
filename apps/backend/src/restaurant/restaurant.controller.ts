import { Body, Controller, Get, Patch } from "@nestjs/common";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import type { RequestUser } from "../common/interfaces/request-user.interface";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";
import { UpdateThemeDto } from "./dto/update-theme.dto";
import { RestaurantService } from "./restaurant.service";

@Controller("restaurant")
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get("me")
  getOwnRestaurant(@CurrentUser() user: RequestUser) {
    return this.restaurantService.getOwnRestaurant(user.restaurantId);
  }

  @Roles("owner")
  @Patch("me")
  updateOwnRestaurant(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantService.updateOwnRestaurant(user.restaurantId, dto);
  }

  @Roles("owner")
  @Patch("me/theme")
  updateTheme(@CurrentUser() user: RequestUser, @Body() dto: UpdateThemeDto) {
    return this.restaurantService.updateTheme(user.restaurantId, dto);
  }
}
