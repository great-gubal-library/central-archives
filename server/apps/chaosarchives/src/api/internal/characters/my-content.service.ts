import { UserInfo } from '@app/auth/model/user-info';
import { Event, NoticeboardItem, Story } from '@app/entity';
import { LinkResultDto } from '@app/shared/dto/links/link-result.dto';
import { MyContentDto } from '@app/shared/dto/links/my-content.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';

@Injectable()
export class MyContentService {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Story) private storyRepo: Repository<Story>,
    @InjectRepository(NoticeboardItem) private noticeboardItemRepo: Repository<NoticeboardItem>,
    private imagesService: ImagesService,
  ) {}

  async getMyContent(characterId: number, user: UserInfo): Promise<MyContentDto> {
    if (!user.characters.some((ch) => ch.id === characterId && ch.verified)) {
      throw new NotFoundException('Invalid character ID');
    }

		const [ events, stories, noticeboardItems, images ] = await Promise.all([
			this.getEvents(characterId),
			this.getStories(characterId),
			this.getNoticeboardItems(characterId),
			this.imagesService.getMyImages(characterId, user),
		]);

    return {
      events,
      stories,
      noticeboardItems,
      images,
    };
  }

  private async getEvents(characterId: number): Promise<LinkResultDto[]> {
    return (
      await this.eventRepo.find({
        where: {
          owner: {
						id: characterId
					},
        },
        select: ['id'],
      })
    ).map((event) => ({
      type: PageType.EVENT,
      id: event.id,
    }));
  }

  private async getStories(characterId: number): Promise<LinkResultDto[]> {
    return (
      await this.storyRepo.find({
        where: {
          owner: {
						id: characterId
					}
        },
        select: ['id'],
      })
    ).map((story) => ({
      type: PageType.STORY,
      id: story.id,
    }));
  }

  private async getNoticeboardItems(characterId: number): Promise<LinkResultDto[]> {
    return (
      await this.noticeboardItemRepo.find({
        where: {
          owner: {
						id: characterId
					}
        },
        select: ['id'],
      })
    ).map((noticeboardItem) => ({
      type: PageType.NOTICEBOARD_ITEM,
      id: noticeboardItem.id,
    }));
  }
}
