import { generateVerificationCode } from "@app/security";
import { Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RppSubscribedEvent } from "../../common/events/rpp-subscribed.event";

@WebSocketGateway({ namespace: 'updates' })
export class UpdatesGateway {
  private readonly log = new Logger(UpdatesGateway.name);

  private readonly socketsByToken = new Map<string, Socket>();

  private readonly tokensBySocket = new Map<Socket, string>();

  private readonly socketsBySubscription = new Map<number, Set<Socket>>();

  private readonly subscriptionsBySocket = new Map<Socket, Set<number>>();

  @WebSocketServer()
  private server: Server;

  constructor() {
    this.log.log("WebSocket gateway created");
  }

	handleConnection(socket: Socket): void {
    const sessionToken = generateVerificationCode();

    this.log.log('Connection established');
    socket.emit('session', {
      sessionToken
    });

    this.socketsByToken.set(sessionToken, socket);
    this.tokensBySocket.set(socket, sessionToken);
    this.subscriptionsBySocket.set(socket, new Set());
  }

  handleDisconnect(socket: Socket): void {
    const token = this.tokensBySocket.get(socket);
    this.tokensBySocket.delete(socket);

    if (token) {
      this.socketsByToken.delete(token);
    }

    const subscriptions = this.subscriptionsBySocket.get(socket);

    if (subscriptions) {
      subscriptions.forEach(subscription => {
        const sockets = this.socketsBySubscription.get(subscription);

        if (sockets) {
          sockets.delete(socket);
        }
      });
    }

    this.log.log('Connection closed');
  }

  @OnEvent('rpp.subscribed', { async: true })
  handleRppSubscribed({ characterId, sessionToken }: RppSubscribedEvent): void {
    const socket = this.socketsByToken.get(sessionToken);

    if (!socket) {
      return;
    }

    this.subscriptionsBySocket.get(socket)!.add(characterId);

    let sockets = this.socketsBySubscription.get(characterId);

    if (!sockets) {
      sockets = new Set();
      this.socketsBySubscription.set(characterId, sockets);
    }

    sockets.add(socket);
  }
}
