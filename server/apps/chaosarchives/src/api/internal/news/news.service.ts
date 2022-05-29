import { serverConfiguration } from "@app/configuration";
import { News, NewsIssue } from "@app/entity";
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
		@InjectRepository(NewsIssue) private newsIssueRepo: Repository<NewsIssue>,
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
		const latestIssue = await this.newsIssueRepo.createQueryBuilder('issue')
			.andWhere('issue.publishedAt IS NOT NULL')
			.orderBy('issue.publishedAt', 'DESC')
			.limit(1)
			.select([ 'issue.id', 'issue.publishedAt' ])
			.getOne();

		if (!latestIssue) {
			return null;
		}

		return this.toIssue(latestIssue);
	}

	private async toIssue(issue: NewsIssue): Promise<NewsIssueDto> {
		const articles = await this.newsRepo.createQueryBuilder('news')
			.innerJoinAndSelect('news.owner', 'owner')
			.innerJoinAndSelect('owner.server', 'server')
			.innerJoinAndSelect('news.category', 'category')
			.where('news.status = :status', { status: NewsStatus.PUBLISHED })
			.andWhere('news.publishedAt IS NOT NULL')
			.orderBy('news.id', 'ASC')
			.limit(SharedConstants.MAX_NEWS_ENTRIES)
			.select([ 'news', 'category.name', 'owner.name', 'server.name', 'owner.newsPseudonym' ])
			.getMany();

		return {
			id: issue.id,
			publishedAt: issue.publishedAt.getTime(),
			articles: articles.map(article => ({
				id: article.id,
				title: article.title,
				slug: article.slug,
				content: article.content,
				category: article.category.name,
				publishedAt: article.publishedAt.getTime(),
				author: {
					name: article.owner.name,
					server: article.owner.server.name,
					pseudonym: article.owner.newsPseudonym || article.owner.name,
				},
			})),
		};
	}
}
