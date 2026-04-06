import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, isValidObjectId } from "mongoose";

import { Menu, type MenuDocument } from "../database/schemas/menu.schema";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { applyMenuDefaults } from "./menu-normalizer";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Menu.name)
    private readonly menuModel: Model<MenuDocument>,
  ) {}

  async listMenus(restaurantId: string) {
    return [await this.ensurePrimaryMenu(restaurantId)];
  }

  async createMenu(restaurantId: string) {
    return this.ensurePrimaryMenu(restaurantId);
  }

  async getMenu(restaurantId: string, menuId: string) {
    return this.findMenuOrThrow(restaurantId, menuId);
  }

  async activateMenu(restaurantId: string, menuId: string) {
    const menu = await this.findMenuOrThrow(restaurantId, menuId);

    if (!menu.isActive) {
      await this.menuModel.updateMany(
        {
          restaurantId,
          _id: { $ne: menu._id },
        },
        { isActive: false },
      );

      menu.isActive = true;
      await menu.save();
    }

    return menu;
  }

  async addCategory(
    restaurantId: string,
    menuId: string,
    dto: CreateCategoryDto,
  ) {
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

  async deleteCategory(
    restaurantId: string,
    menuId: string,
    categoryId: string,
  ) {
    const menu = await this.findMenuOrThrow(restaurantId, menuId);
    const nextCategories = menu.categories.filter(
      (entry) => String(entry._id) !== categoryId,
    );

    if (nextCategories.length === menu.categories.length) {
      throw new NotFoundException("Category not found.");
    }

    menu.categories = nextCategories as never;
    menu.markModified("categories");
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
      currency: dto.currency ?? "MNT",
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
    const nextItems = category.items.filter(
      (entry) => String(entry._id) !== itemId,
    );

    if (nextItems.length === category.items.length) {
      throw new NotFoundException("Menu item not found.");
    }

    category.items = nextItems as never;
    menu.markModified("categories");
    await menu.save();
    return menu;
  }

  private async findMenuOrThrow(restaurantId: string, menuId: string) {
    if (!isValidObjectId(menuId)) {
      throw new BadRequestException("Menu id is invalid.");
    }

    const menu = await this.menuModel.findOne({ _id: menuId, restaurantId });

    if (!menu) {
      throw new NotFoundException("Menu not found.");
    }

    return this.normalizeMenu(menu);
  }

  private async ensurePrimaryMenu(restaurantId: string) {
    const menu = await this.menuModel
      .findOne({ restaurantId })
      .sort({ isActive: -1, updatedAt: -1, createdAt: -1 });

    if (!menu) {
      return this.menuModel.create({
        restaurantId,
        isActive: true,
        categories: [],
      });
    }

    await this.normalizeMenu(menu);

    await this.menuModel.updateMany(
      {
        restaurantId,
        _id: { $ne: menu._id },
      },
      { isActive: false },
    );

    if (!menu.isActive) {
      menu.isActive = true;
      await menu.save();
    }

    return menu;
  }

  private async normalizeMenu(menu: MenuDocument) {
    if (applyMenuDefaults(menu)) {
      await menu.save();
    }

    return menu;
  }

  private findCategoryOrThrow(menu: MenuDocument, categoryId: string) {
    const category = menu.categories.find(
      (entry) => String(entry._id) === categoryId,
    );

    if (!category) {
      throw new NotFoundException("Category not found.");
    }

    return category;
  }
}
