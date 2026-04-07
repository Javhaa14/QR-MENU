import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import type { RestaurantListItem, StaffUser } from "@qr-menu/shared-types";

import { Menu, type MenuDocument } from "../database/schemas/menu.schema";
import { Order, type OrderDocument } from "../database/schemas/order.schema";
import { Restaurant, type RestaurantDocument } from "../database/schemas/restaurant.schema";
import { DEFAULT_THEME_CONFIG } from "../database/schemas/theme.defaults";
import { User, type UserDocument } from "../database/schemas/user.schema";
import { createSlug } from "../auth/utils/create-slug.util";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";
import { UpdateTablesDto } from "./dto/update-tables.dto";
import { UpdateThemeDto } from "./dto/update-theme.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { SetTemplateDto } from "./dto/set-template.dto";
import { TemplateService } from "../template/template.service";
import type { BrandConfig, ThemeConfig } from "@qr-menu/shared-types";

function normalizeTables(tables: string[]) {
  return Array.from(
    new Set(
      tables
        .map((table) => table.trim())
        .filter(Boolean),
    ),
  );
}

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Menu.name)
    private readonly menuModel: Model<MenuDocument>,
    private readonly templateService: TemplateService,
  ) {}

  private async mergeThemeConfig(
    templateId?: string,
    brandConfig?: BrandConfig,
    currentThemeConfig?: ThemeConfig,
  ): Promise<ThemeConfig> {
    if (!templateId) {
      return currentThemeConfig ?? DEFAULT_THEME_CONFIG;
    }

    const template = await this.templateService.findOne(templateId);
    const brand = brandConfig ?? template.defaultBrand;

    return {
      ...brand,
      components: template.slotConfig,
    };
  }

  async listRestaurants(): Promise<RestaurantListItem[]> {
    const restaurants = await this.restaurantModel
      .find()
      .sort({ createdAt: -1 })
      .lean();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const orderCounts = await this.orderModel.aggregate<{
      _id: string;
      ordersToday: number;
    }>([
      {
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lt: startOfTomorrow,
          },
        },
      },
      {
        $group: {
          _id: "$restaurantId",
          ordersToday: { $sum: 1 },
        },
      },
    ]);

    const ordersByRestaurantId = new Map(
      orderCounts.map((entry) => [entry._id, entry.ordersToday]),
    );

    return restaurants.map((restaurant) => ({
      _id: String(restaurant._id),
      slug: restaurant.slug,
      name: restaurant.name,
      logo: restaurant.logo,
      templateId: restaurant.templateId,
      brandConfig: restaurant.brandConfig,
      themeConfig: restaurant.themeConfig,
      plan: restaurant.plan,
      restaurantType: restaurant.restaurantType ?? "menu_only",
      tables: restaurant.restaurantType === "order_enabled" ? restaurant.tables ?? [] : [],
      isActive: restaurant.isActive,
      createdAt: restaurant.createdAt?.toISOString(),
      ordersToday: ordersByRestaurantId.get(String(restaurant._id)) ?? 0,
    }));
  }

  async getRestaurant(restaurantId: string) {
    return this.findByIdOrThrow(restaurantId);
  }

  async getOwnRestaurant(restaurantId: string) {
    return this.findByIdOrThrow(restaurantId);
  }

  async createRestaurant(dto: CreateRestaurantDto) {
    const slug = await this.generateUniqueSlug(dto.slug ?? dto.name);
    
    // Default values
    let themeConfig = DEFAULT_THEME_CONFIG;
    let templateId: string | undefined;

    const restaurant = await this.restaurantModel.create({
      slug,
      name: dto.name,
      logo: dto.logo ?? "",
      plan: dto.plan,
      restaurantType: dto.restaurantType ?? "menu_only",
      tables: [],
      isActive: true,
      templateId,
      themeConfig,
    });

    await this.menuModel.create({
      restaurantId: restaurant.id,
      isActive: true,
      categories: [],
    });

    return restaurant;
  }

  async updateRestaurant(restaurantId: string, dto: UpdateRestaurantDto) {
    const restaurant = await this.findByIdOrThrow(restaurantId);

    if (dto.name !== undefined) {
      restaurant.name = dto.name;
    }

    if (dto.slug !== undefined) {
      restaurant.slug = await this.generateUniqueSlug(dto.slug, restaurant.id);
    }

    if (dto.logo !== undefined) {
      restaurant.logo = dto.logo;
    }

    if (dto.plan !== undefined) {
      restaurant.plan = dto.plan;
    }

    if (dto.isActive !== undefined) {
      restaurant.isActive = dto.isActive;
    }

    await restaurant.save();
    return restaurant;
  }

  async setTemplate(restaurantId: string, dto: SetTemplateDto) {
    const restaurant = await this.findByIdOrThrow(restaurantId);
    const template = await this.templateService.findOne(dto.templateId);

    restaurant.templateId = template.id;
    // When changing template, we merge immediately to keep themeConfig in sync
    restaurant.themeConfig = await this.mergeThemeConfig(
      template.id,
      restaurant.brandConfig,
    );

    await restaurant.save();
    return restaurant;
  }

  async updateBrand(restaurantId: string, dto: UpdateBrandDto) {
    const restaurant = await this.findByIdOrThrow(restaurantId);
    restaurant.brandConfig = dto;

    // Merge logic
    restaurant.themeConfig = await this.mergeThemeConfig(
      restaurant.templateId,
      dto,
      restaurant.themeConfig,
    );

    await restaurant.save();
    return restaurant;
  }

  async updateTheme(restaurantId: string, dto: UpdateThemeDto) {
    // Keep this for legacy / superadmin full control if needed, 
    // but update it to sync with brandConfig/template if we want.
    const restaurant = await this.findByIdOrThrow(restaurantId);
    restaurant.themeConfig = {
      ...dto,
      darkMode: dto.darkMode ?? false,
      showImages: dto.showImages ?? true,
      heroImage: dto.heroImage ?? "",
    };

    await restaurant.save();
    return restaurant;
  }

  async updateTables(restaurantId: string, dto: UpdateTablesDto) {
    const restaurant = await this.findByIdOrThrow(restaurantId);

    if (restaurant.restaurantType !== "order_enabled") {
      restaurant.tables = [];
      await restaurant.save();
      return restaurant;
    }

    restaurant.tables = normalizeTables(dto.tables);
    await restaurant.save();
    return restaurant;
  }

  async deleteRestaurant(restaurantId: string) {
    await this.findByIdOrThrow(restaurantId);

    await Promise.all([
      this.restaurantModel.deleteOne({ _id: restaurantId }),
      this.userModel.deleteMany({
        restaurantId,
        role: "restaurant_admin",
      }),
      this.menuModel.deleteMany({ restaurantId }),
      this.orderModel.deleteMany({ restaurantId }),
    ]);

    return { deleted: true };
  }

  async listStaff(restaurantId: string): Promise<StaffUser[]> {
    await this.findByIdOrThrow(restaurantId);

    const users = await this.userModel
      .find({
        restaurantId,
        role: "restaurant_admin",
      })
      .sort({ createdAt: -1 })
      .lean();

    return users.map((user) => ({
      _id: String(user._id),
      email: user.email,
      restaurantId: user.restaurantId ?? null,
      role: user.role,
    }));
  }

  private async findByIdOrThrow(restaurantId: string) {
    const restaurant = await this.restaurantModel.findById(restaurantId);

    if (!restaurant) {
      throw new NotFoundException("Restaurant not found.");
    }

    return restaurant;
  }

  private async generateUniqueSlug(input: string, currentRestaurantId?: string) {
    const baseSlug = createSlug(input);

    if (!baseSlug) {
      throw new BadRequestException("Restaurant slug cannot be empty.");
    }

    let candidate = baseSlug;
    let counter = 2;

    while (
      await this.restaurantModel.exists({
        slug: candidate,
        ...(currentRestaurantId
          ? { _id: { $ne: currentRestaurantId } }
          : {}),
      })
    ) {
      candidate = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return candidate;
  }
}
