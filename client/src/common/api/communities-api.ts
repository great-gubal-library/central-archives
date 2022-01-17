import APITransport from './api-transport';
import { MyCommunitiesInfoDto } from '@app/shared/dto/communities/my-communities-info.dto';
import { CommunityFCSummaryDto } from '@app/shared/dto/communities/community-fc-summary.dto';

export default class CommunitiesAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('communities');
  }

	async getMyCommunities(characterId: number): Promise<MyCommunitiesInfoDto> {
		return this.transport.authGet('my-communities', { characterId });
	}

	async setFCFromLodestone(characterId: number): Promise<CommunityFCSummaryDto> {
		return this.transport.authPost('free-company', { characterId });
	}

	async unsetFC(characterId: number): Promise<void> {
		return this.transport.authPost('free-company/unset', { characterId });
	}
}
