import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RestaurantGuard } from "../common/guards/restaurant.guard";
import { CreatePublicOrderDto } from "./dto/create-public-order.dto";
import { ListOrdersQueryDto } from "./dto/list-orders-query.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrderService } from "./order.service";

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Public()
  @Post("public/orders")
  createPublicOrder(@Body() dto: CreatePublicOrderDto) {
    return this.orderService.createPublicOrder(dto);
  }

  @Roles("superadmin", "restaurant_admin")
  @UseGuards(RestaurantGuard)
  @Get("orders/:restaurantId")
  listOrders(
    @Param("restaurantId") restaurantId: string,
    @Query() query: ListOrdersQueryDto,
  ) {
    return this.orderService.listOrders(restaurantId, query.status);
  }

  @Roles("superadmin", "restaurant_admin")
  @UseGuards(RestaurantGuard)
  @Patch("orders/:restaurantId/:orderId/status")
  updateStatus(
    @Param("restaurantId") restaurantId: string,
    @Param("orderId") orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(restaurantId, orderId, dto);
  }
}
