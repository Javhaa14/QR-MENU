import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import type { OrderItem } from "@qr-menu/shared-types";

import { Menu, type MenuDocument } from "../database/schemas/menu.schema";
import { Order, type OrderDocument } from "../database/schemas/order.schema";
import { Restaurant, type RestaurantDocument } from "../database/schemas/restaurant.schema";
import { applyMenuDefaults } from "../menu/menu-normalizer";
import { CreatePublicOrderDto } from "./dto/create-public-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrderGateway } from "./order.gateway";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Menu.name)
    private readonly menuModel: Model<MenuDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    private readonly orderGateway: OrderGateway,
  ) {}

  async createPublicOrder(dto: CreatePublicOrderDto) {
    if (dto.items.length === 0) {
      throw new BadRequestException("Order must contain at least one item.");
    }

    const restaurant = await this.restaurantModel.findOne({
      _id: dto.restaurantId,
      isActive: true,
    });

    if (!restaurant) {
      throw new NotFoundException("Restaurant not found.");
    }

    const normalizedTableNumber = dto.tableNumber?.trim() ?? "";

    if (
      normalizedTableNumber &&
      restaurant.restaurantType === "order_enabled" &&
      !(restaurant.tables ?? []).includes(normalizedTableNumber)
    ) {
      throw new BadRequestException("Selected table is not configured.");
    }

    const menu = await this.menuModel.findOne({
      restaurantId: dto.restaurantId,
    }).sort({ isActive: -1, updatedAt: -1, createdAt: -1 });

    if (!menu) {
      throw new NotFoundException("Menu not found.");
    }

    if (applyMenuDefaults(menu)) {
      await menu.save();
    }

    const menuItems = menu.categories.flatMap((category) => category.items);
    const normalizedItems: OrderItem[] = dto.items.map((input) => {
      const menuItem = menuItems.find(
        (entry) => String(entry._id) === input.menuItemId,
      );

      if (!menuItem) {
        throw new BadRequestException(
          `Menu item ${input.menuItemId} does not exist on the active menu.`,
        );
      }

      if (!menuItem.isAvailable) {
        throw new BadRequestException(`${menuItem.name} is currently unavailable.`);
      }

      return {
        menuItemId: String(menuItem._id),
        name: menuItem.name,
        price: menuItem.price,
        quantity: input.quantity,
        note: input.note?.trim() ?? "",
      };
    });

    const totalPrice = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await this.orderModel.create({
      restaurantId: dto.restaurantId,
      tableNumber: normalizedTableNumber,
      items: normalizedItems,
      status: "pending",
      totalPrice,
    });

    this.orderGateway.emitNewOrder(dto.restaurantId, order.toJSON());
    return order;
  }

  async listOrders(restaurantId: string, status?: string) {
    return this.orderModel
      .find({
        restaurantId,
        ...(status ? { status } : {}),
      })
      .sort({ createdAt: -1 });
  }

  async updateStatus(
    restaurantId: string,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      restaurantId,
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    order.status = dto.status;
    await order.save();

    this.orderGateway.emitOrderUpdated(restaurantId, order.toJSON());
    return order;
  }
}
