import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';
import { StoryFilterDto } from '@app/shared/dto/stories/story-filter.dto';
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import APITransport, { QueryParams } from './api-transport';

export default class StoriesAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('stories');
  }

  async getStories(filter?: StoryFilterDto): Promise<PagingResultDto<StorySummaryDto>> {
    return this.transport.get<PagingResultDto<StorySummaryDto>>('', filter as QueryParams);
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
