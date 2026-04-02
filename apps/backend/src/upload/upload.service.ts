import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {
    const cloudinaryUrl = this.configService.get<string>("CLOUDINARY_URL");

    if (cloudinaryUrl) {
      process.env.CLOUDINARY_URL = cloudinaryUrl;
      cloudinary.config({ secure: true });
    }
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Image file is required.");
    }

    const cloudinaryUrl = this.configService.get<string>("CLOUDINARY_URL");

    if (!cloudinaryUrl) {
      throw new InternalServerErrorException("CLOUDINARY_URL is not configured.");
    }

    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "qr-menu",
      resource_type: "image",
    });

    return { url: result.secure_url };
  }
}
