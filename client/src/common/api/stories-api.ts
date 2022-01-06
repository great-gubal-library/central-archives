import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import APITransport from './api-transport';

export default class StoriesAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('stories');
  }

  async getStories(params: { characterId?: number }): Promise<StorySummaryDto[]> {
    return this.transport.get<StorySummaryDto[]>('', params);
  }

  async getStory(id: number): Promise<StoryDto> {
    return this.transport.tokenGet<StoryDto>(`${id}`);
  }

  async createStory(story: StoryDto): Promise<IdWrapper> {
    return this.transport.authPost<IdWrapper>('', story);
  }

  async editStory(story: StoryDto): Promise<void> {
    return this.transport.authPut<void>(`${story.id || -1}`, story);
  }
}
