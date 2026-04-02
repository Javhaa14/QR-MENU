import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "../auth/auth.module";
import { Menu, MenuSchema } from "../database/schemas/menu.schema";
import { Order, OrderSchema } from "../database/schemas/order.schema";
import { Restaurant, RestaurantSchema } from "../database/schemas/restaurant.schema";
import { OrderController } from "./order.controller";
import { OrderGateway } from "./order.gateway";
import { OrderService } from "./order.service";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Menu.name, schema: MenuSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderGateway],
  exports: [OrderService, OrderGateway],
})
export class OrderModule {}
