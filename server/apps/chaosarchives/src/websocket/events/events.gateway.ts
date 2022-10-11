import { generateVerificationCode } from "@app/security";
import { Logger } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ namespace: 'events' })
export class EventsGateway {
  private readonly log = new Logger(EventsGateway.name);

  private readonly socketsByToken = new Map<string, Socket>();

  private readonly tokensBySocket = new Map<Socket, string>();

  @WebSocketServer()
  private server: Server;

  constructor() {
    this.log.log("WebSocket gateway created");
  }

	async handleConnection(socket: Socket): Promise<void> {
    const sessionToken = generateVerificationCode();

    this.log.log('Connection established');
    socket.emit('session', {
      sessionToken
    });

    this.socketsByToken.set(sessionToken, socket);
    this.tokensBySocket.set(socket, sessionToken);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    const token = this.tokensBySocket.get(socket);
    this.tokensBySocket.delete(socket);

    if (token) {
      this.socketsByToken.delete(token);
    }

    this.log.log('Connection closed');
  }
}
