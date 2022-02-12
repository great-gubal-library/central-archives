import APITransport from './api-transport';

export default class CommunitiesAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('communities');
  }
}
