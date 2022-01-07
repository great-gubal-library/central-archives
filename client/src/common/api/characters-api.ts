import { AddCharacterRequestDto } from '@app/shared/dto/characters/add-character-request.dto';
import { CharacterContentDto } from '@app/shared/dto/characters/character-content.dto';
import { CharacterProfileFilterDto } from '@app/shared/dto/characters/character-profile-filter.dto';
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { CharacterRefreshResultDto } from '@app/shared/dto/characters/character-refresh-result.dto';
import { CharacterRegistrationStatusResultDto } from '@app/shared/dto/characters/character-registration-status-result.dto';
import { CharacterSummaryDto } from '@app/shared/dto/characters/character-summary.dto';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';
import { ImageDto } from '@app/shared/dto/image/image.dto';
import { SessionCharacterDto } from '@app/shared/dto/user/session-character.dto';
import APITransport from './api-transport';

export default class CharactersAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('characters');
  }

  async getCharacterProfile(name: string, server: string): Promise<CharacterProfileDto> {
    return this.transport.tokenGet<CharacterProfileDto>(`profile/${server}/${name}`);
  }

  async getCharacterProfiles(filter?: CharacterProfileFilterDto): Promise<PagingResultDto<CharacterSummaryDto>> {
    return this.transport.get<PagingResultDto<CharacterSummaryDto>>(
      '', filter as { [k: string]: string|number|boolean });
  }

  async saveCharacter(character: CharacterProfileDto): Promise<void> {
    await this.transport.authPut<void>('profile', character);
  }

  async addAccountCharacter(request: AddCharacterRequestDto): Promise<SessionCharacterDto> {
    return this.transport.authPost<SessionCharacterDto>('', request);
  }

  async refreshCharacter(request: IdWrapper): Promise<CharacterRefreshResultDto> {
    return this.transport.authPost<CharacterRefreshResultDto>('refresh', request);
  }

  async getCharacterContent(id: number): Promise<CharacterContentDto> {
    return this.transport.get<CharacterContentDto>(`${id}/content`);
  }

  async getCharacterRegistrationStatus(params: {
    name: string;
    lodestoneId: number;
  }): Promise<CharacterRegistrationStatusResultDto> {
    return this.transport.tokenGet<CharacterRegistrationStatusResultDto>('registration-status', params);
  }

  async getMyImages(characterId: number): Promise<ImageDto[]> {
    return this.transport.authGet<ImageDto[]>(`${characterId}/my-images`);
  }
}
