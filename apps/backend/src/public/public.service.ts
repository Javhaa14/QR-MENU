import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as QRCode from "qrcode";

import { Menu, type MenuDocument } from "../database/schemas/menu.schema";
import { Restaurant, type RestaurantDocument } from "../database/schemas/restaurant.schema";

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Menu.name)
    private readonly menuModel: Model<MenuDocument>,
    private readonly configService: ConfigService,
  ) {}

  async getPublicMenu(slug: string) {
    const restaurant = await this.restaurantModel.findOne({
      slug,
      isActive: true,
    });

    if (!restaurant) {
      throw new NotFoundException("Restaurant not found.");
    }

    const menu = await this.menuModel.findOne({
      restaurantId: restaurant.id,
      isActive: true,
    });

    if (!menu) {
      throw new NotFoundException("Active menu not found.");
    }

    return {
      restaurant: {
        _id: restaurant.id,
        slug: restaurant.slug,
        name: restaurant.name,
        logo: restaurant.logo,
        themeConfig: restaurant.themeConfig,
      },
      menu,
    };
  }

  async generateQrBuffer(slug: string, tableNumber?: string) {
    const restaurant = await this.restaurantModel.findOne({
      slug,
      isActive: true,
    });

    if (!restaurant) {
      throw new NotFoundException("Restaurant not found.");
    }

    const baseUrl =
      this.configService.get<string>("PUBLIC_MENU_BASE_URL") ??
      this.configService.get<string>("FRONTEND_URL") ??
      "https://yourdomain.com";

    const url = new URL(`/menu/${slug}`, baseUrl);

    if (tableNumber) {
      url.searchParams.set("table", tableNumber);
    }

    return QRCode.toBuffer(url.toString(), {
      type: "png",
      width: 512,
      margin: 1,
    });
  }
}
