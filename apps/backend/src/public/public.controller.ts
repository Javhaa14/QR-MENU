import {
  Controller,
  Get,
  Header,
  Param,
  Res,
  StreamableFile,
} from "@nestjs/common";
import type { Response } from "express";

import { Public } from "../common/decorators/public.decorator";
import { PublicService } from "./public.service";

@Public()
@Controller("public")
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get("menu/:slug")
  @Header("Cache-Control", "public, max-age=60, s-maxage=60")
  getPublicMenu(@Param("slug") slug: string) {
    return this.publicService.getPublicMenu(slug);
  }

  @Get("qr/:slug")
  async getRestaurantQr(
    @Param("slug") slug: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const buffer = await this.publicService.generateQrBuffer(slug);
    response.set("Content-Type", "image/png");
    return new StreamableFile(buffer);
  }

  @Get("qr/:slug/table/:tableNumber")
  async getTableQr(
    @Param("slug") slug: string,
    @Param("tableNumber") tableNumber: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const buffer = await this.publicService.generateQrBuffer(slug, tableNumber);
    response.set("Content-Type", "image/png");
    return new StreamableFile(buffer);
  }
}
