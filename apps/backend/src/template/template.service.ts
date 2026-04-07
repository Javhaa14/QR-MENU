import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Template, TemplateDocument } from "../database/schemas/template.schema";
import type { Template as ITemplate } from "@qr-menu/shared-types";

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(Template.name)
    private readonly templateModel: Model<TemplateDocument>,
  ) {}

  async findAll(onlyActive = true): Promise<TemplateDocument[]> {
    const query = onlyActive ? { active: true } : {};
    return this.templateModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<TemplateDocument> {
    const template = await this.templateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException("Template not found");
    }
    return template;
  }

  async create(data: Partial<ITemplate>): Promise<TemplateDocument> {
    return this.templateModel.create(data);
  }

  async update(id: string, data: Partial<ITemplate>): Promise<TemplateDocument> {
    const template = await this.templateModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!template) {
      throw new NotFoundException("Template not found");
    }
    return template;
  }

  async remove(id: string): Promise<void> {
    const result = await this.templateModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException("Template not found");
    }
  }
}
