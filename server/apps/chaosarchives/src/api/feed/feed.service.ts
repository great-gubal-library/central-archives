import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { Injectable } from '@nestjs/common';
import { FeedApiOptions } from './feed-api-options';
import { Feed, Item } from 'feed';
import { serverConfiguration } from '@app/configuration';
import { DateTime } from 'luxon';
import SharedConstants from '@app/shared/shared-constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Story } from '@app/entity';
import { Repository } from 'typeorm';
import { ImagesService } from '../internal/images/images.service';
import { SiteRegion } from '@app/shared/enums/region.enum';

const MAX_RESULTS = SharedConstants.DEFAULT_ROWS_PER_PAGE;
const CATEGORIES = ['Games', 'Roleplaying'];

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

  async getStoriesRss(region: SiteRegion, options: FeedApiOptions): Promise<string> {
    const query = this.storyRepo
      .createQueryBuilder('story')
      .innerJoinAndSelect('story.owner', 'character')
      .innerJoinAndSelect('character.server', 'server')
      .orderBy('story.createdAt', 'DESC')
      .select(['story', 'character.name', 'server.name'])
      .limit(MAX_RESULTS);

    if (region !== SiteRegion.GLOBAL) {
      query.andWhere('server.region = :region', { region });
    }

    const stories = await query.getMany();
    stories.reverse();

    const items = stories.map(
      (story) =>
        <Item>{
          title: story.title,
          content: story.content,
          date: story.createdAt,
          link: `${serverConfiguration.frontendRoot[region]}/story/${story.id}`,
          author: [
            {
              name: `${story.owner.name} (${story.owner.server})`,
              link: `${serverConfiguration.frontendRoot[region]}/${story.owner.server}/${story.owner.name.replace(' ', '_')}`,
            },
          ],
        },
    );

    const regionConfig = SharedConstants.regions[region];

    return this.createFeed(region, {
      title: `Stories — ${regionConfig.name}`,
      description: `Latest stories from ${regionConfig.description}`,
      pagePath: '/stories',
      options,
      items,
    });
  }

  async getArtworkRss(region: SiteRegion, options: FeedApiOptions): Promise<string> {
    return this.getImagesRss(region, ImageCategory.ARTWORK, options);
  }

  async getScreenshotsRss(region: SiteRegion, options: FeedApiOptions): Promise<string> {
    return this.getImagesRss(region, ImageCategory.SCREENSHOT, options);
  }

  private async getImagesRss(region: SiteRegion, category: ImageCategory, options: FeedApiOptions): Promise<string> {
    const images = (
      await this.imagesService.getImages(region, {
        category,
        limit: MAX_RESULTS,
      })
    ).data;

    const items = images.map(
      (image) =>
        <Item>{
          title: image.title,
          content: `<img src="${image.url}" />`,
          date: new Date(image.createdAt),
          link: `${serverConfiguration.frontendRoot[region]}/image/${image.id}`,
          image: image.url,
          author: [
            {
              name: `${image.owner} (${image.ownerServer})`,
              link: `${serverConfiguration.frontendRoot[region]}/${image.ownerServer}/${image.owner!.replace(' ', '_')}`,
            },
          ],
        },
    );

    const regionConfig = SharedConstants.regions[region];

    return this.createFeed(region, {
      title: `${category === ImageCategory.ARTWORK ? 'Artwork' : 'Screenshots'} — ${regionConfig.name}`,
      description: `Latest ${category === ImageCategory.ARTWORK ? 'artwork' : 'screenshots'} from ${regionConfig.description}`,
      pagePath: `/gallery/${category}`,
      options,
      items,
    });
  }

  private async createFeed(region: SiteRegion, { title, description, options, pagePath, items }: FeedContent) {
    const url = `${serverConfiguration.frontendRoot[region]}${options.path}`;
    const currentYear = DateTime.utc().year;
    const regionConfig = SharedConstants.regions[region];

    const feed = new Feed({
      title,
      description,
      id: url,
      link: `${serverConfiguration.frontendRoot[region]}${pagePath}`,
      language: 'en',
      copyright: `All text and images on this site are © 2021–${currentYear} by their respective owners.`,
      favicon: `${serverConfiguration.frontendRoot[region]}/favicon.ico`,
      generator: regionConfig.name,
    });

    CATEGORIES.forEach((category) => feed.addCategory(category));
    items.forEach((item) => feed.addItem(item));
    return feed.rss2();
  }
}
