import { Controller, Get, Header } from "@nestjs/common";
import { FeedService } from "./feed.service";

const RSS_CONTENT_TYPE = 'application/rss+xml';

@Controller('feed')
export class FeedController {
	constructor(private feedService: FeedService) { }

	@Get('stories.rss')
	@Header('Content-Type', RSS_CONTENT_TYPE)
	async getStoriesRss(): Promise<string> {
		return this.feedService.getStoriesRss({
			path: '/api/feed/stories.rss',
		});
	}

	@Get('artwork.rss')
	@Header('Content-Type', RSS_CONTENT_TYPE)
	async getArtworkRss(): Promise<string> {
		return this.feedService.getArtworkRss({
			path: '/api/feed/artwork.rss',
		});
	}

	@Get('screenshots.rss')
	@Header('Content-Type', RSS_CONTENT_TYPE)
	async getScreenshotsRss(): Promise<string> {
		return this.feedService.getScreenshotsRss({
			path: '/api/feed/screenshots.rss',
		});
	}
}
