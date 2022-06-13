import { UserInfo } from "@app/auth/model/user-info";
import { serverConfiguration } from "@app/configuration";
import { Character, News, NewsCategory, NewsIssue } from "@app/entity";
import { NewsArticleDto } from "@app/shared/dto/news/news-article.dto";
import { NewsIssueDto } from "@app/shared/dto/news/news-issue.dto";
import { NewsDto } from "@app/shared/dto/news/news.dto";
import { NewsRole } from "@app/shared/enums/news-role.enum";
import { NewsStatus } from "@app/shared/enums/news-status.enum";
import SharedConstants from "@app/shared/SharedConstants";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import crypto from 'crypto';
import { padStart } from "lodash";
import { DateTime } from "luxon";
import slugify from 'slugify';
import { Connection, EntityManager, IsNull, Like, Not, Repository } from "typeorm";
import { ImagesService } from "../images/images.service";

@Injectable()
export class NewsService {
	constructor(
		@InjectRepository(News) private newsRepo: Repository<News>,
		@InjectRepository(NewsIssue) private newsIssueRepo: Repository<NewsIssue>,
		private connection: Connection,
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
		const day = padStart(dateTime.day.toString(), 2, '0');

		return `${serverConfiguration.newsRoot}/${year}/${month}/${day}/${news.slug}`;
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

	async getIssues(): Promise<number[]> {
		const issues = await this.newsIssueRepo.createQueryBuilder('issue')
			.andWhere('issue.publishedAt IS NOT NULL')
			.orderBy('issue.publishedAt', 'DESC')
			.select([ 'issue.id' ])
			.getMany();

		return issues.map(issue => issue.id);
	}

	async getIssueById(id: number): Promise<NewsIssueDto> {
		const issue = await this.newsIssueRepo.createQueryBuilder('issue')
			.where('issue.id = :id', { id })
			.andWhere('issue.publishedAt IS NOT NULL')
			.orderBy('issue.publishedAt', 'DESC')
			.select([ 'issue.id', 'issue.publishedAt' ])
			.getOne();

		if (!issue) {
			throw new NotFoundException('Issue not found');
		}

		return this.toIssue(issue);
	}

	private async toIssue(issue: NewsIssue): Promise<NewsIssueDto> {
		const articles = await this.newsRepo.createQueryBuilder('news')
			.innerJoinAndSelect('news.owner', 'owner')
			.innerJoinAndSelect('owner.server', 'server')
			.innerJoinAndSelect('news.category', 'category')
			.innerJoinAndSelect('news.issue', 'issue')
			.where('news.status = :status', { status: NewsStatus.PUBLISHED })
			.andWhere('news.publishedAt IS NOT NULL')
			.andWhere('issue.id = :issueId', { issueId: issue.id })
			.orderBy('news.id', 'ASC')
			.limit(SharedConstants.MAX_NEWS_ENTRIES)
			.select([ 'news', 'category.name', 'owner.name', 'server.name', 'owner.newsPseudonym' ])
			.getMany();

		return {
			id: issue.id,
			publishedAt: issue.publishedAt.getTime(),
			articles: articles.map(article => this.toArticle(article)),
		};
	}

	async getArticleBySlug(slug: string): Promise<NewsArticleDto> {
		const article = await this.newsRepo.createQueryBuilder('news')
			.innerJoinAndSelect('news.owner', 'owner')
			.innerJoinAndSelect('owner.server', 'server')
			.innerJoinAndSelect('news.category', 'category')
			.where('news.status = :status', { status: NewsStatus.PUBLISHED })
			.andWhere('news.publishedAt IS NOT NULL')
			.andWhere('news.slug = :slug', { slug })
			.select([ 'news', 'category.name', 'owner.name', 'server.name', 'owner.newsPseudonym' ])
			.getOne();

		if (!article) {
			throw new NotFoundException('Article not found');
		}

		return this.toArticle(article);
	}

	async getArticleById(id: number, user?: UserInfo): Promise<NewsArticleDto> {
		const article = await this.newsRepo.createQueryBuilder('news')
			.innerJoinAndSelect('news.owner', 'owner')
			.innerJoinAndSelect('owner.server', 'server')
			.innerJoinAndSelect('owner.user', 'user')
			.innerJoinAndSelect('news.category', 'category')
			.where('news.id = :id', { id })
			.andWhere('(:userId IS NULL OR user.id = :userId)', { userId: user?.id || null })			
			.select([ 'news', 'category.name', 'owner.id', 'owner.name', 'server.name', 'owner.newsPseudonym' ])
			.getOne();

		if (!article) {
			throw new NotFoundException('Article not found');
		}

		return this.toArticle(article, user);
	}

	async getMyArticles(characterId: number, user: UserInfo): Promise<NewsArticleDto[]> {
		if (!user.characters.find(ch => ch.id === characterId && ch.verified)) {
			throw new ForbiddenException('Invalid character');
		}

		const articles = await this.newsRepo.createQueryBuilder('news')
			.innerJoinAndSelect('news.owner', 'owner')
			.innerJoinAndSelect('owner.server', 'server')
			.innerJoinAndSelect('news.category', 'category')
			.where('owner.id = :characterId', { characterId })			
			.orderBy('news.createdAt', 'DESC')
			.select([ 'news', 'category.name', 'owner.id', 'owner.name', 'server.name', 'owner.newsPseudonym' ])
			.getMany();

		return articles.map(article => this.toArticle(article, user));
	}

	async createArticle(articleDto: NewsArticleDto, user: UserInfo): Promise<NewsArticleDto> {
		if (articleDto.id) {
			throw new BadRequestException('Article ID must be empty');
		}

		const isEditor = user.characters.some(ch => ch.newsRole === NewsRole.EDITOR);

		if (!isEditor && articleDto.status !== NewsStatus.DRAFT && articleDto.status !== NewsStatus.SUBMITTED) {
			throw new BadRequestException('Invalid article status');
		}

		const articleEntity = await this.connection.transaction(async em => {
			const author = await em.getRepository(Character).findOne({
				where: {
					user: {
						id: user.id,
					},
					verifiedAt: Not(IsNull()),
					name: articleDto.author.name,
					server: {
						name: articleDto.author.server,
					},
				},
				relations: [ 'server' ]
			});

			if (!author) {
				throw new ForbiddenException('Invalid author');
			}
	
			const newsRepo = em.getRepository(News);

			const article = newsRepo.create({
				owner: author,
				category: await em.getRepository(NewsCategory).findOne(1), // temp
				slug: crypto.randomUUID(),
			});

			await this.mergeArticleFromDto(em, article, articleDto);
			await newsRepo.save(article);
			return article;
		});

		return this.toArticle(articleEntity, user);
	}

	async updateArticle(articleDto: NewsArticleDto, user: UserInfo): Promise<NewsArticleDto> {
		if (!articleDto.id) {
			throw new BadRequestException('Article ID required');
		}

		const isEditor = user.characters.some(ch => ch.newsRole === NewsRole.EDITOR);

		if (!isEditor && articleDto.status !== NewsStatus.DRAFT && articleDto.status !== NewsStatus.SUBMITTED) {
			throw new BadRequestException('Invalid article status');
		}

		const articleEntity = await this.connection.transaction(async em => {
			const newsRepo = em.getRepository(News);
			const article = await newsRepo.createQueryBuilder('news')
				.innerJoinAndSelect('news.owner', 'owner')
				.innerJoinAndSelect('owner.server', 'server')
				.innerJoinAndSelect('owner.user', 'user')
				.innerJoinAndSelect('news.category', 'category')
				.where('news.id = :id', { id: articleDto.id })	
				.select([ 'news', 'category.name', 'owner.id', 'owner.name', 'server.name', 'owner.newsPseudonym' ])
				.getOne();

			if (!article) {
				throw new NotFoundException('Article not found');
			}

			if (!this.canEdit(article, user)) {
				throw new ForbiddenException('You cannot edit this article');
			}

			await this.mergeArticleFromDto(em, article, articleDto);
			await newsRepo.save(article);
			return article;
		});

		return this.toArticle(articleEntity, user);
	}

	private async mergeArticleFromDto(em: EntityManager, article: News, articleDto: NewsArticleDto): Promise<void> {
		article.title = articleDto.title;
		article.subtitle = articleDto.subtitle;
		article.content = articleDto.content;

		if (article.status === NewsStatus.PUBLISHED) {
			if (articleDto.status !== NewsStatus.PUBLISHED) {
				throw new BadRequestException('Cannot unpublish a published article');
			}

			// check if we need to set the slug
			const newSlug = slugify(article.title);

			if (newSlug !== article.slug) {
				article.slug = await this.getUniqueSlug(em, article, newSlug);
			}
		} else {
			article.status = articleDto.status;
		}
	}

	private async getUniqueSlug(em: EntityManager, article: News, newSlug: string): Promise<string> {
		const existingSlugs = new Set((await em.getRepository(News).find({
			where: {
				slug: Like(`${newSlug}%`),
			},
			select: [ 'slug' ]
		})).map(a => a.slug));

		for (let uniquifier = 0; ; uniquifier++) {
			const candidateSlug = uniquifier === 0 ? newSlug : `${newSlug}-${uniquifier}`;

			if (!existingSlugs.has(candidateSlug)) {
				return candidateSlug;
			}
		}
	}

	private toArticle(article: News, user?: UserInfo): NewsArticleDto {
		return {
			id: article.id,
			canEdit: this.canEdit(article, user),
			canDelete: false,
			status: article.status,
			title: article.title,
			subtitle: article.subtitle,
			slug: article.slug,
			content: article.content,
			category: article.category.name,
			publishedAt: article.publishedAt ? article.publishedAt.getTime() : null,
			author: {
				name: article.owner.name,
				server: article.owner.server.name,
				pseudonym: article.owner.newsPseudonym || article.owner.name,
			},
		};
	}

	private canEdit(article: News, user?: UserInfo): boolean {
		if (!user) {
			return false;
		}

		if (user.characters.find(ch => ch.newsRole === NewsRole.EDITOR)) {
			return true; // Editors can edit everything
		}

		const character = user.characters.find(ch => ch.id === article.owner.id);

		if (!character) {
			return false;
		}

		// Authors can edit their own articles, guests can edit their own unpublished articles
		return article.status !== NewsStatus.PUBLISHED || character.newsRole === NewsRole.AUTHOR;
	}
}
