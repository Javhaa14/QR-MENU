import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcryptjs";

import type { AuthResponse, UserRole } from "@qr-menu/shared-types";

import type { JwtPayload } from "../common/interfaces/jwt-payload.interface";
import { Restaurant, type RestaurantDocument } from "../database/schemas/restaurant.schema";
import { User, type UserDocument } from "../database/schemas/user.schema";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userModel.findOne({ email: dto.email.toLowerCase() });

    if (existingUser) {
      throw new BadRequestException("Email is already registered.");
    }

    const restaurant = await this.restaurantModel.findById(dto.restaurantId);

    if (!restaurant) {
      throw new NotFoundException("Restaurant not found.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      restaurantId: restaurant.id,
      role: "restaurant_admin",
    });

    return this.buildAuthResponse(user.id, user.email, user.restaurantId, user.role);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    return this.buildAuthResponse(user.id, user.email, user.restaurantId, user.role);
  }

  private buildAuthResponse(
    userId: string,
    email: string,
    restaurantId: string | null,
    role: UserRole,
  ): AuthResponse {
    const payload: JwtPayload = {
      sub: userId,
      email,
      restaurantId,
      role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        _id: userId,
        email,
        restaurantId,
        role,
      },
    };
  }
}
