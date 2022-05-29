import { serverConfiguration } from "@app/configuration";
import { News } from "@app/entity";
import { NewsIssueDto } from "@app/shared/dto/news/news-issue.dto";
import { NewsDto } from "@app/shared/dto/news/news.dto";
import { NewsStatus } from "@app/shared/enums/news-status.enum";
import SharedConstants from "@app/shared/SharedConstants";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { padStart } from "lodash";
import { DateTime } from "luxon";
import { Repository } from "typeorm";
import { ImagesService } from "../images/images.service";

@Injectable()
export class NewsService {
	constructor(
		@InjectRepository(News) private newsRepo: Repository<News>,
		private imagesService: ImagesService,
	) {}

	async getLatestSummaries(): Promise<NewsDto[]> {
		const latestNews = await this.newsRepo.createQueryBuilder('news')
			.innerJoinAndSelect('news.owner', 'owner')
			.leftJoinAndSelect('news.image', 'image')
			.leftJoinAndSelect('image.owner', 'imageOwner')
			.where('news.status = :status', { status: NewsStatus.PUBLISHED })
			.andWhere('news.publishedAt IS NOT NULL')
			.orderBy('news.publishedAt', 'DESC')
			.limit(SharedConstants.MAX_NEWS_ENTRIES)
			.select([ 'news', 'owner.name', 'owner.newsPseudonym', 'image', 'imageOwner.id' ])
			.getMany();

		return latestNews.map(news => {
			const image = news.image;
			const author = news.owner;

			return {
				title: news.title,
				author: author.newsPseudonym || author.name,
				content: news.summary,
				date: news.publishedAt.getTime(),
				link: this.buildLink(news),
				image: image ? this.imagesService.getUrl(image) : '',
			};
		});
	}

	private buildLink(news: News): string {
		const dateTime = DateTime.fromJSDate(news.publishedAt, {
			zone: SharedConstants.FFXIV_SERVER_TIMEZONE
		});
		const year = dateTime.year;
		const month = padStart(dateTime.month.toString(), 2, '0');

		return `${serverConfiguration.newsRoot}/${year}/${month}/${news.slug}`;
	}

	async getLatestIssue(): Promise<NewsIssueDto|null> {
		return null;
	}
}
