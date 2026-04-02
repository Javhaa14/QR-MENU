import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Menu, type MenuDocument } from "../database/schemas/menu.schema";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { CreateMenuDto } from "./dto/create-menu.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Menu.name)
    private readonly menuModel: Model<MenuDocument>,
  ) {}

  async listMenus(restaurantId: string) {
    return this.menuModel.find({ restaurantId }).sort({ updatedAt: -1 });
  }

  async createMenu(restaurantId: string, dto: CreateMenuDto) {
    const existingCount = await this.menuModel.countDocuments({ restaurantId });

    return this.menuModel.create({
      restaurantId,
      name: dto.name,
      isActive: existingCount === 0,
      categories: [],
    });
  }

  async getMenu(restaurantId: string, menuId: string) {
    return this.findMenuOrThrow(restaurantId, menuId);
  }

  async activateMenu(restaurantId: string, menuId: string) {
    await this.findMenuOrThrow(restaurantId, menuId);
    await this.menuModel.updateMany({ restaurantId }, { isActive: false });

    return this.menuModel.findByIdAndUpdate(
      menuId,
      { isActive: true },
      { new: true },
    );
  }

  async addCategory(restaurantId: string, menuId: string, dto: CreateCategoryDto) {
    const menu = await this.findMenuOrThrow(restaurantId, menuId);
    menu.categories.push({
      name: dto.name,
      position: dto.position ?? menu.categories.length,
      items: [],
    } as never);
    await menu.save();

    return menu;
  }

  async updateCategory(
    restaurantId: string,
    menuId: string,
    categoryId: string,
    dto: UpdateCategoryDto,
  ) {
    const menu = await this.findMenuOrThrow(restaurantId, menuId);
    const category = menu.categories.find(
      (entry) => String(entry._id) === categoryId,
    );

    if (!category) {
      throw new NotFoundException("Category not found.");
    }

    if (dto.name !== undefined) {
      category.name = dto.name;
    }

    if (dto.position !== undefined) {
      category.position = dto.position;
    }

    await menu.save();
    return menu;
  }

  async deleteCategory(restaurantId: string, menuId: string, categoryId: string) {
    const menu = await this.findMenuOrThrow(restaurantId, menuId);
    const nextCategories = menu.categories.filter(
      (entry) => String(entry._id) !== categoryId,
    );

    if (nextCategories.length === menu.categories.length) {
      throw new NotFoundException("Category not found.");
    }

    menu.categories = nextCategories as never;
    await menu.save();
    return menu;
  }

  async addItem(
    restaurantId: string,
    menuId: string,
    categoryId: string,
    dto: CreateMenuItemDto,
  ) {
    const menu = await this.findMenuOrThrow(restaurantId, menuId);
    const category = this.findCategoryOrThrow(menu, categoryId);

    category.items.push({
      name: dto.name,
      description: dto.description ?? "",
      price: dto.price,
      currency: dto.currency,
      image: dto.image ?? "",
      tags: dto.tags ?? [],
      allergens: dto.allergens ?? [],
      isAvailable: dto.isAvailable ?? true,
    } as never);

    await menu.save();
    return menu;
  }

  async updateItem(
    restaurantId: string,
    menuId: string,
    categoryId: string,
    itemId: string,
    dto: UpdateMenuItemDto,
  ) {
    const menu = await this.findMenuOrThrow(restaurantId, menuId);
    const category = this.findCategoryOrThrow(menu, categoryId);
    const item = category.items.find((entry) => String(entry._id) === itemId);

    if (!item) {
      throw new NotFoundException("Menu item not found.");
    }

    if (dto.name !== undefined) item.name = dto.name;
    if (dto.description !== undefined) item.description = dto.description;
    if (dto.price !== undefined) item.price = dto.price;
    if (dto.currency !== undefined) item.currency = dto.currency;
    if (dto.image !== undefined) item.image = dto.image;
    if (dto.tags !== undefined) item.tags = dto.tags;
    if (dto.allergens !== undefined) item.allergens = dto.allergens;
    if (dto.isAvailable !== undefined) item.isAvailable = dto.isAvailable;

    await menu.save();
    return menu;
  }

  async toggleItemAvailability(
    restaurantId: string,
    menuId: string,
    categoryId: string,
    itemId: string,
  ) {
    const menu = await this.findMenuOrThrow(restaurantId, menuId);
    const category = this.findCategoryOrThrow(menu, categoryId);
    const item = category.items.find((entry) => String(entry._id) === itemId);

    if (!item) {
      throw new NotFoundException("Menu item not found.");
    }

    item.isAvailable = !item.isAvailable;
    await menu.save();
    return menu;
  }

  async deleteItem(
    restaurantId: string,
    menuId: string,
    categoryId: string,
    itemId: string,
  ) {
    const menu = await this.findMenuOrThrow(restaurantId, menuId);
    const category = this.findCategoryOrThrow(menu, categoryId);
    const nextItems = category.items.filter((entry) => String(entry._id) !== itemId);

    if (nextItems.length === category.items.length) {
      throw new NotFoundException("Menu item not found.");
    }

    category.items = nextItems as never;
    await menu.save();
    return menu;
  }

  private async findMenuOrThrow(restaurantId: string, menuId: string) {
    const menu = await this.menuModel.findOne({ _id: menuId, restaurantId });

    if (!menu) {
      throw new NotFoundException("Menu not found.");
    }

    return menu;
  }

  private findCategoryOrThrow(menu: MenuDocument, categoryId: string) {
    const category = menu.categories.find((entry) => String(entry._id) === categoryId);

    if (!category) {
      throw new NotFoundException("Category not found.");
    }

    return category;
  }
}
