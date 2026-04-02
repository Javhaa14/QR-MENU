import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { Menu, MenuSchema } from "../database/schemas/menu.schema";
import { Restaurant, RestaurantSchema } from "../database/schemas/restaurant.schema";
import { PublicController } from "./public.controller";
import { PublicService } from "./public.service";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Menu.name, schema: MenuSchema },
    ]),
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
