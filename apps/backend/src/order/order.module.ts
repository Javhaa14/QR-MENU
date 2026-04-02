import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Menu, MenuSchema } from "../database/schemas/menu.schema";
import { Order, OrderSchema } from "../database/schemas/order.schema";
import { OrderController } from "./order.controller";
import { OrderGateway } from "./order.gateway";
import { OrderService } from "./order.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Menu.name, schema: MenuSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderGateway],
  exports: [OrderService, OrderGateway],
})
export class OrderModule {}
