import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Public } from "../common/decorators/public.decorator";
import { TemplateService } from "./template.service";
import type { Template as ITemplate } from "@qr-menu/shared-types";

@Controller("templates")
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Public()
  @Get()
  findAll() {
    return this.templateService.findAll(true);
  }

  @Roles("superadmin")
  @Get("admin")
  findAllAdmin() {
    return this.templateService.findAll(false);
  }

  @Roles("superadmin")
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.templateService.findOne(id);
  }

  @Roles("superadmin")
  @Post()
  create(@Body() data: Partial<ITemplate>) {
    return this.templateService.create(data);
  }

  @Roles("superadmin")
  @Patch(":id")
  update(@Param("id") id: string, @Body() data: Partial<ITemplate>) {
    return this.templateService.update(id, data);
  }

  @Roles("superadmin")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.templateService.remove(id);
  }
}
