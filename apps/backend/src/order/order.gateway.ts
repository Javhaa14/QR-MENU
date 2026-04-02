import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";

import type { JwtPayload } from "../common/interfaces/jwt-payload.interface";

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class OrderGateway implements OnGatewayConnection {
  constructor(private readonly jwtService: JwtService) {}

  @WebSocketServer()
  server!: any;

  handleConnection(_client: any) {}

  @SubscribeMessage("joinRestaurant")
  handleJoinRestaurant(
    client: any,
    payload: { restaurantId: string; token?: string },
  ) {
    if (!payload?.token || !payload.restaurantId) {
      return;
    }

    let decoded: JwtPayload;

    try {
      decoded = this.jwtService.verify<JwtPayload>(payload.token);
    } catch {
      return;
    }

    if (
      decoded.role === "restaurant_admin" &&
      decoded.restaurantId !== payload.restaurantId
    ) {
      return;
    }

    client.join(this.roomName(payload.restaurantId));
    return { joined: this.roomName(payload.restaurantId) };
  }

  emitNewOrder(restaurantId: string, order: unknown) {
    this.server.to(this.roomName(restaurantId)).emit("newOrder", order);
  }

  emitOrderUpdated(restaurantId: string, order: unknown) {
    this.server.to(this.roomName(restaurantId)).emit("orderUpdated", order);
  }

  private roomName(restaurantId: string) {
    return `restaurant-${restaurantId}`;
  }
}
