import { Character } from "@app/entity";
import { generateVerificationCode } from "@app/security";
import { Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { RppSubscribedEvent } from "../../common/events/rpp-subscribed.event";

@WebSocketGateway({ namespace: 'updates' })
export class UpdatesGateway {
  private readonly log = new Logger(UpdatesGateway.name);

  private readonly socketsByToken = new Map<string, Socket>();

  private readonly tokensBySocket = new Map<Socket, string>();

  private readonly socketsBySubscription = new Map<string, Set<Socket>>();

  private readonly subscriptionsBySocket = new Map<Socket, Set<string>>();

	handleConnection(socket: Socket): void {
    const sessionToken = generateVerificationCode();

    socket.emit('session', {
      sessionToken
    });

    this.socketsByToken.set(sessionToken, socket);
    this.tokensBySocket.set(socket, sessionToken);
    this.subscriptionsBySocket.set(socket, new Set());

    this.log.debug('Connection established');
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

    this.log.debug('Connection closed');
  }

  @OnEvent('rpp.subscribed', { async: true })
  handleRppSubscribed({ name, server, sessionToken }: RppSubscribedEvent): void {
    if (server.includes('/')) {
      this.log.error(`Invalid server: ${server}`);
      return;
    }

    const fullName = `${server}/${name}`;
    const socket = this.socketsByToken.get(sessionToken);

    if (!socket) {
      return;
    }

    this.subscriptionsBySocket.get(socket)!.add(fullName);

    let sockets = this.socketsBySubscription.get(fullName);

    if (!sockets) {
      sockets = new Set();
      this.socketsBySubscription.set(fullName, sockets);
    }

    sockets.add(socket);
    this.log.debug('RPP subscribed: ', fullName);
  }

  @OnEvent('character.updated', { async: true })
  handleCharacterUpdated(character: Character): void {
    const fullName = `${character.server}/${character.name}`;
    const sockets = this.socketsBySubscription.get(fullName);

    if (!sockets) {
      return;
    }

    // Subscriptions are one-shot: a client receiving an update notification is unsubscribed from this character
    // and should requery the character via the RPP API, which will resubscribe them
    sockets.forEach(socket => {
      socket.emit('character.updated', {
        name: character.name,
        server: character.server.name,
      });

      this.subscriptionsBySocket.get(socket)!.delete(fullName);
    });

    sockets.clear();
    this.log.debug('Character updated: ', character.id);
  }
}
