import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Restaurant, RestaurantSchema } from "../database/schemas/restaurant.schema";
import { RestaurantController } from "./restaurant.controller";
import { RestaurantService } from "./restaurant.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {}
