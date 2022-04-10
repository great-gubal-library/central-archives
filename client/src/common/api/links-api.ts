import { LinkResultDto } from '@app/shared/dto/links/link-result.dto';
import APITransport from './api-transport';

export default class LinksAPI {
	private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('links');
  }

	async resolve(name: string): Promise<LinkResultDto[]> {
		return this.transport.get(`resolve/${name}`);
	}
}
