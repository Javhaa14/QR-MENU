import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Menu, MenuSchema } from "../database/schemas/menu.schema";
import { Order, OrderSchema } from "../database/schemas/order.schema";
import { Restaurant, RestaurantSchema } from "../database/schemas/restaurant.schema";
import { User, UserSchema } from "../database/schemas/user.schema";
import { RestaurantController } from "./restaurant.controller";
import { RestaurantService } from "./restaurant.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Menu.name, schema: MenuSchema },
    ]),
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {}
