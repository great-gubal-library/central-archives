import { Controller, Get, Header } from "@nestjs/common";
import { FeedService } from "./feed.service";
import { ClientRegion } from "../../common/client-region.decorator";
import { SiteRegion } from "@app/shared/enums/region.enum";

const RSS_CONTENT_TYPE = 'application/rss+xml';

@Controller('feed')
export class FeedController {
	constructor(private feedService: FeedService) { }

	@Get('stories.rss')
	@Header('Content-Type', RSS_CONTENT_TYPE)
	async getStoriesRss(@ClientRegion() region: SiteRegion): Promise<string> {
		return this.feedService.getStoriesRss(region, {
			path: '/api/feed/stories.rss',
		});
	}

	@Get('artwork.rss')
	@Header('Content-Type', RSS_CONTENT_TYPE)
	async getArtworkRss(@ClientRegion() region: SiteRegion): Promise<string> {
		return this.feedService.getArtworkRss(region, {
			path: '/api/feed/artwork.rss',
		});
	}

	@Get('screenshots.rss')
	@Header('Content-Type', RSS_CONTENT_TYPE)
	async getScreenshotsRss(@ClientRegion() region: SiteRegion): Promise<string> {
		return this.feedService.getScreenshotsRss(region, {
			path: '/api/feed/screenshots.rss',
		});
	}
}
