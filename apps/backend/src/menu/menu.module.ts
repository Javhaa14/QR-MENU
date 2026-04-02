import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Menu, MenuSchema } from "../database/schemas/menu.schema";
import { MenuController } from "./menu.controller";
import { MenuService } from "./menu.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }]),
  ],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
