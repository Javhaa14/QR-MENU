import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import type { RequestUser } from "../common/interfaces/request-user.interface";
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

  @Get("orders")
  listOrders(
    @CurrentUser() user: RequestUser,
    @Query() query: ListOrdersQueryDto,
  ) {
    return this.orderService.listOrders(user.restaurantId, query.status);
  }

  @Roles("owner", "staff")
  @Patch("orders/:id/status")
  updateStatus(
    @CurrentUser() user: RequestUser,
    @Param("id") orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(user.restaurantId, orderId, dto);
  }
}
