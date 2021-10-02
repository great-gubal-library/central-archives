import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { EventDto } from '@app/shared/dto/events/event.dto';
import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import { NewProfileDto } from '@app/shared/dto/main-page/new-profile.dto';
import { NewsDto } from '@app/shared/dto/news/news.dto';
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import APITransport from './api-transport';
import UserAPI from './user-api';

export default class API {
  private readonly transport = new APITransport();

  public readonly prefix = this.transport.prefix;

  // Sub-APIs
  
  readonly user = new UserAPI(this.transport);

  // Access token management

  hasAccessToken() {
    return this.transport.hasAccessToken();
  }

  setAccessToken(accessToken: string | null) {
    this.transport.setAccessToken(accessToken);
  }

  // Regular API calls

  async getMainPageContent(): Promise<MainPageContentDto> {
    return this.transport.get<MainPageContentDto>('main-page');
  }

  async getUpdatedNews(): Promise<NewsDto[]> {
    return this.transport.get<NewsDto[]>('main-page/news');
  }

  async getEvents(): Promise<EventDto[]> {
    return this.transport.get<EventDto[]>('events');
  }

  // Character profile
  async getCharacterProfile(name: string, server: string): Promise<CharacterProfileDto> {
    return this.transport.tokenGet<CharacterProfileDto>(`characters/profile/${server}/${name}`);
  }

  async getCharacterProfiles(): Promise<NewProfileDto[]> {
    return this.transport.get<NewProfileDto[]>('characters');
  }

  async saveCharacter(character: CharacterProfileDto): Promise<void> {
    await this.transport.authPut<void>('characters/profile', character);
  }

  // Stories
  async getStories(params: { characterId?: number }): Promise<StorySummaryDto[]> {
    return this.transport.get<StorySummaryDto[]>('stories', params);
  }

  async getStory(id: number): Promise<StoryDto> {
    return this.transport.tokenGet<StoryDto>(`stories/${id}`);
  }

  async createStory(story: StoryDto): Promise<IdWrapper> {
    return this.transport.authPost<IdWrapper>('stories', story);
  }

  async editStory(story: StoryDto): Promise<void> {
    return this.transport.authPut<void>(`stories/${story.id || -1}`, story);
  }
}
