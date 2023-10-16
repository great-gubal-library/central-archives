import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { Injectable } from '@nestjs/common';
import { FeedApiOptions } from './feed-api-options';
import { Feed, Item } from 'feed';
import { serverConfiguration } from '@app/configuration';
import { DateTime } from 'luxon';
import SharedConstants from '@app/shared/SharedConstants';
import { InjectRepository } from '@nestjs/typeorm';
import { Story } from '@app/entity';
import { Repository } from 'typeorm';
import { ImagesService } from '../internal/images/images.service';

const MAX_RESULTS = SharedConstants.DEFAULT_ROWS_PER_PAGE;
const SITE_DESCRIPTION = 'Chaos Archives, the FFXIV roleplay portal to Chaos EU';
const CATEGORIES = ['Games', 'Roleplaying', 'Chaos Archives'];

export interface FeedContent {
  title: string;
  description: string;
  options: FeedApiOptions;
  pagePath: string;
  items: Item[];
}

@Injectable()
export class FeedService {
  constructor(@InjectRepository(Story) private storyRepo: Repository<Story>, private imagesService: ImagesService) {}

  async getStoriesRss(options: FeedApiOptions): Promise<string> {
    const stories = await this.storyRepo
      .createQueryBuilder('story')
      .innerJoinAndSelect('story.owner', 'character')
      .innerJoinAndSelect('character.server', 'server')
      .orderBy('story.createdAt', 'DESC')
      .select(['story', 'character.name', 'server.name'])
      .limit(MAX_RESULTS)
      .getMany();
    stories.reverse();

    const items = stories.map(
      (story) =>
        <Item>{
          title: story.title,
          content: story.content,
          date: story.createdAt,
          link: `${serverConfiguration.frontendRoot}/story/${story.id}`,
          author: [
            {
              name: `${story.owner.name} (${story.owner.server})`,
              link: `${serverConfiguration.frontendRoot}/${story.owner.server}/${story.owner.name.replace(' ', '_')}`,
            },
          ],
        },
    );

    return this.createFeed({
      title: 'Stories — Chaos Archives',
      description: `Latest stories from ${SITE_DESCRIPTION}`,
      pagePath: '/stories',
      options,
      items,
    });
  }

  async getArtworkRss(options: FeedApiOptions): Promise<string> {
    return this.getImagesRss(ImageCategory.ARTWORK, options);
  }

  async getScreenshotsRss(options: FeedApiOptions): Promise<string> {
    return this.getImagesRss(ImageCategory.SCREENSHOT, options);
  }

  private async getImagesRss(category: ImageCategory, options: FeedApiOptions): Promise<string> {
    const images = (await this.imagesService.getImages({
			category,
			limit: MAX_RESULTS,
		})).data;

		const items = images.map(
      (image) =>
        <Item>{
          title: image.title,
          content: `<img src="${image.url}" />`,
          date: new Date(image.createdAt),
          link: `${serverConfiguration.frontendRoot}/image/${image.id}`,
          image: image.url,
          author: [
            {
              name: `${image.owner} (${image.ownerServer})`,
              link: `${serverConfiguration.frontendRoot}/${image.ownerServer}/${image.owner!.replace(' ', '_')}`,
            },
          ],
        },
    );

    return this.createFeed({
      title: `${category === ImageCategory.ARTWORK ? 'Artwork' : 'Screenshots'} — Chaos Archives`,
      description: `Latest ${category === ImageCategory.ARTWORK ? 'artwork' : 'screenshots'} from ${SITE_DESCRIPTION}`,
      pagePath: `/gallery/${category}`,
      options,
      items,
    });
  }

  private async createFeed({ title, description, options, pagePath, items }: FeedContent) {
    const url = `${serverConfiguration.frontendRoot}${options.path}`;
    const currentYear = DateTime.utc().year;

    const feed = new Feed({
      title,
      description,
      id: url,
      link: `${serverConfiguration.frontendRoot}${pagePath}`,
      language: 'en',
      copyright: `All text and images on this site are © 2021–${currentYear} by their respective owners.`,
      favicon: `${serverConfiguration.frontendRoot}/favicon.ico`,
      generator: 'Chaos Archives',
    });

    CATEGORIES.forEach((category) => feed.addCategory(category));
    items.forEach((item) => feed.addItem(item));
    return feed.rss2();
  }
}
