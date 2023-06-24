import { LinkResultDto } from '@app/shared/dto/links/link-result.dto';
import APITransport from './api-transport';
import { PlayerProfileDto } from '@app/shared/dto/player-profiles/player-profile.dto';
import { PlayerProfileEditDto } from '@app/shared/dto/player-profiles/player-profile-edit.dto';

export default class PlayerProfilesAPI {
	private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('player-profiles');
  }

	async getPlayerProfile(id: number): Promise<PlayerProfileDto> {
		return this.transport.get(`${id}`);
	}

	async updateOwnPlayerProfile(playerProfileDto: PlayerProfileEditDto): Promise<void> {
		await this.transport.authPut('', playerProfileDto);
	}
	
	async deleteOwnPlayerProfile(): Promise<void> {
		await this.transport.authDelete('');
	}
}
