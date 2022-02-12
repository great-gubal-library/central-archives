import { MyCommunitySummaryDto } from '@app/shared/dto/communities/my-community-summary.dto';
import APITransport from './api-transport';

export default class CommunitiesAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('communities');
  }

  async getMyCommunities(characterId: number): Promise<MyCommunitySummaryDto[]> {
    return this.transport.authGet('my-communities', { characterId });
  }
}
