import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import type { RequestUser } from "../common/interfaces/request-user.interface";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";
import { UpdateThemeDto } from "./dto/update-theme.dto";
import { RestaurantService } from "./restaurant.service";

@Controller("restaurants")
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Roles("superadmin")
  @Get()
  listRestaurants() {
    return this.restaurantService.listRestaurants();
  }

  @Roles("restaurant_admin")
  @Get("me")
  getOwnRestaurant(@CurrentUser() user: RequestUser) {
    return this.restaurantService.getOwnRestaurant(user.restaurantId!);
  }

  @Roles("superadmin")
  @Post()
  createRestaurant(@Body() dto: CreateRestaurantDto) {
    return this.restaurantService.createRestaurant(dto);
  }

  @Roles("superadmin")
  @Get(":id/staff")
  listStaff(@Param("id") restaurantId: string) {
    return this.restaurantService.listStaff(restaurantId);
  }

  @Roles("superadmin")
  @Get(":id")
  getRestaurant(@Param("id") restaurantId: string) {
    return this.restaurantService.getRestaurant(restaurantId);
  }

  @Roles("superadmin")
  @Patch(":id")
  updateRestaurant(
    @Param("id") restaurantId: string,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantService.updateRestaurant(restaurantId, dto);
  }

  @Roles("superadmin")
  @Patch(":id/theme")
  updateTheme(
    @Param("id") restaurantId: string,
    @Body() dto: UpdateThemeDto,
  ) {
    return this.restaurantService.updateTheme(restaurantId, dto);
  }

  @Roles("superadmin")
  @Delete(":id")
  deleteRestaurant(@Param("id") restaurantId: string) {
    return this.restaurantService.deleteRestaurant(restaurantId);
  }
}
