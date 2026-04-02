import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { Roles } from "../common/decorators/roles.decorator";
import { RestaurantGuard } from "../common/guards/restaurant.guard";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { CreateMenuDto } from "./dto/create-menu.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";
import { MenuService } from "./menu.service";

@Controller("restaurants/:restaurantId/menus")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Roles("superadmin", "restaurant_admin")
  @UseGuards(RestaurantGuard)
  @Get()
  listMenus(@Param("restaurantId") restaurantId: string) {
    return this.menuService.listMenus(restaurantId);
  }

  @Roles("superadmin")
  @Post()
  createMenu(
    @Param("restaurantId") restaurantId: string,
    @Body() dto: CreateMenuDto,
  ) {
    return this.menuService.createMenu(restaurantId, dto);
  }

  @Roles("superadmin", "restaurant_admin")
  @UseGuards(RestaurantGuard)
  @Get(":id")
  getMenu(
    @Param("restaurantId") restaurantId: string,
    @Param("id") menuId: string,
  ) {
    return this.menuService.getMenu(restaurantId, menuId);
  }

  @Roles("superadmin")
  @Patch(":id/activate")
  activateMenu(
    @Param("restaurantId") restaurantId: string,
    @Param("id") menuId: string,
  ) {
    return this.menuService.activateMenu(restaurantId, menuId);
  }

  @Roles("superadmin")
  @Post(":id/categories")
  addCategory(
    @Param("restaurantId") restaurantId: string,
    @Param("id") menuId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.menuService.addCategory(restaurantId, menuId, dto);
  }

  @Roles("superadmin")
  @Patch(":id/categories/:catId")
  updateCategory(
    @Param("restaurantId") restaurantId: string,
    @Param("id") menuId: string,
    @Param("catId") categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.menuService.updateCategory(
      restaurantId,
      menuId,
      categoryId,
      dto,
    );
  }

  @Roles("superadmin")
  @Delete(":id/categories/:catId")
  deleteCategory(
    @Param("restaurantId") restaurantId: string,
    @Param("id") menuId: string,
    @Param("catId") categoryId: string,
  ) {
    return this.menuService.deleteCategory(restaurantId, menuId, categoryId);
  }

  @Roles("superadmin")
  @Post(":id/categories/:catId/items")
  addItem(
    @Param("restaurantId") restaurantId: string,
    @Param("id") menuId: string,
    @Param("catId") categoryId: string,
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.menuService.addItem(restaurantId, menuId, categoryId, dto);
  }

  @Roles("superadmin")
  @Patch(":id/categories/:catId/items/:itemId")
  updateItem(
    @Param("restaurantId") restaurantId: string,
    @Param("id") menuId: string,
    @Param("catId") categoryId: string,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuService.updateItem(
      restaurantId,
      menuId,
      categoryId,
      itemId,
      dto,
    );
  }

  @Roles("superadmin", "restaurant_admin")
  @UseGuards(RestaurantGuard)
  @Patch(":id/categories/:catId/items/:itemId/toggle")
  toggleItemAvailability(
    @Param("restaurantId") restaurantId: string,
    @Param("id") menuId: string,
    @Param("catId") categoryId: string,
    @Param("itemId") itemId: string,
  ) {
    return this.menuService.toggleItemAvailability(
      restaurantId,
      menuId,
      categoryId,
      itemId,
    );
  }

  @Roles("superadmin")
  @Delete(":id/categories/:catId/items/:itemId")
  deleteItem(
    @Param("restaurantId") restaurantId: string,
    @Param("id") menuId: string,
    @Param("catId") categoryId: string,
    @Param("itemId") itemId: string,
  ) {
    return this.menuService.deleteItem(
      restaurantId,
      menuId,
      categoryId,
      itemId,
    );
  }
}
