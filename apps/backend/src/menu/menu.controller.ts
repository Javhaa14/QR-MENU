import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import type { RequestUser } from "../common/interfaces/request-user.interface";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { CreateMenuDto } from "./dto/create-menu.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";
import { MenuService } from "./menu.service";

@Controller("menu")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  listMenus(@CurrentUser() user: RequestUser) {
    return this.menuService.listMenus(user.restaurantId);
  }

  @Roles("owner")
  @Post()
  createMenu(@CurrentUser() user: RequestUser, @Body() dto: CreateMenuDto) {
    return this.menuService.createMenu(user.restaurantId, dto);
  }

  @Get(":id")
  getMenu(@CurrentUser() user: RequestUser, @Param("id") menuId: string) {
    return this.menuService.getMenu(user.restaurantId, menuId);
  }

  @Roles("owner")
  @Patch(":id/activate")
  activateMenu(@CurrentUser() user: RequestUser, @Param("id") menuId: string) {
    return this.menuService.activateMenu(user.restaurantId, menuId);
  }

  @Roles("owner")
  @Post(":id/categories")
  addCategory(
    @CurrentUser() user: RequestUser,
    @Param("id") menuId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.menuService.addCategory(user.restaurantId, menuId, dto);
  }

  @Roles("owner")
  @Patch(":id/categories/:catId")
  updateCategory(
    @CurrentUser() user: RequestUser,
    @Param("id") menuId: string,
    @Param("catId") categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.menuService.updateCategory(
      user.restaurantId,
      menuId,
      categoryId,
      dto,
    );
  }

  @Roles("owner")
  @Delete(":id/categories/:catId")
  deleteCategory(
    @CurrentUser() user: RequestUser,
    @Param("id") menuId: string,
    @Param("catId") categoryId: string,
  ) {
    return this.menuService.deleteCategory(user.restaurantId, menuId, categoryId);
  }

  @Roles("owner")
  @Post(":id/categories/:catId/items")
  addItem(
    @CurrentUser() user: RequestUser,
    @Param("id") menuId: string,
    @Param("catId") categoryId: string,
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.menuService.addItem(user.restaurantId, menuId, categoryId, dto);
  }

  @Roles("owner")
  @Patch(":id/categories/:catId/items/:itemId")
  updateItem(
    @CurrentUser() user: RequestUser,
    @Param("id") menuId: string,
    @Param("catId") categoryId: string,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuService.updateItem(
      user.restaurantId,
      menuId,
      categoryId,
      itemId,
      dto,
    );
  }

  @Roles("owner")
  @Patch(":id/categories/:catId/items/:itemId/toggle")
  toggleItemAvailability(
    @CurrentUser() user: RequestUser,
    @Param("id") menuId: string,
    @Param("catId") categoryId: string,
    @Param("itemId") itemId: string,
  ) {
    return this.menuService.toggleItemAvailability(
      user.restaurantId,
      menuId,
      categoryId,
      itemId,
    );
  }

  @Roles("owner")
  @Delete(":id/categories/:catId/items/:itemId")
  deleteItem(
    @CurrentUser() user: RequestUser,
    @Param("id") menuId: string,
    @Param("catId") categoryId: string,
    @Param("itemId") itemId: string,
  ) {
    return this.menuService.deleteItem(
      user.restaurantId,
      menuId,
      categoryId,
      itemId,
    );
  }
}
