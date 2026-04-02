import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Restaurant, type RestaurantDocument } from "../database/schemas/restaurant.schema";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";
import { UpdateThemeDto } from "./dto/update-theme.dto";

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
  ) {}

  async getOwnRestaurant(restaurantId: string) {
    return this.findByIdOrThrow(restaurantId);
  }

  async updateOwnRestaurant(restaurantId: string, dto: UpdateRestaurantDto) {
    const restaurant = await this.findByIdOrThrow(restaurantId);

    if (dto.name !== undefined) {
      restaurant.name = dto.name;
    }

    if (dto.logo !== undefined) {
      restaurant.logo = dto.logo;
    }

    await restaurant.save();
    return restaurant;
  }

  async updateTheme(restaurantId: string, dto: UpdateThemeDto) {
    const restaurant = await this.findByIdOrThrow(restaurantId);
    restaurant.themeConfig = {
      ...restaurant.themeConfig,
      ...dto,
      colors: dto.colors,
      components: dto.components,
    };

    await restaurant.save();
    return restaurant;
  }

  private async findByIdOrThrow(restaurantId: string) {
    const restaurant = await this.restaurantModel.findById(restaurantId);

    if (!restaurant) {
      throw new NotFoundException("Restaurant not found.");
    }

    return restaurant;
  }
}
