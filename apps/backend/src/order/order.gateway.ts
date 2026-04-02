import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class OrderGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: any;

  handleConnection(_client: any) {}

  @SubscribeMessage("joinRestaurant")
  handleJoinRestaurant(client: any, payload: { restaurantId: string }) {
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
