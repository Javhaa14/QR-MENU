import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "../auth/auth.module";
import { Menu, MenuSchema } from "../database/schemas/menu.schema";
import { Restaurant, RestaurantSchema } from "../database/schemas/restaurant.schema";
import { MenuController } from "./menu.controller";
import { MenuWriteGuard } from "./guards/menu-write.guard";
import { MenuService } from "./menu.service";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Menu.name, schema: MenuSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
  ],
  controllers: [MenuController],
  providers: [MenuService, MenuWriteGuard],
  exports: [MenuService],
})
export class MenuModule {}
