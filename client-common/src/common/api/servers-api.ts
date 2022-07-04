import { DatacenterDto } from '@app/shared/dto/servers/datacenter-dto';
import APITransport from './api-transport';

export default class ServersAPI {
	private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('servers');
  }

	async getDatacenters(): Promise<DatacenterDto[]> {
		return this.transport.get('datacenters');
	}
}
