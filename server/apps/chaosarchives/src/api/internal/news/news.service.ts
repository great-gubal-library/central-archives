import { UserInfo } from "@app/auth/model/user-info";
import { s3Configuration, serverConfiguration } from "@app/configuration";
import { Character, Image, News, NewsCategory, NewsIssue } from "@app/entity";
import { ImageSummaryDto } from "@app/shared/dto/image/image-summary.dto";
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
import parse from "node-html-parser";
import slugify from 'slugify';
import { Connection, EntityManager, In, IsNull, Like, Not, Repository } from "typeorm";
import { ImagesService } from "../images/images.service";

@Injectable()
export class NewsService {
	constructor(
		@InjectRepository(News) private newsRepo: Repository<News>,
		@InjectRepository(NewsIssue) private newsIssueRepo: Repository<NewsIssue>,
		@InjectRepository(Image) private imageRepo: Repository<Image>,
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
		const isEditor = !!user && user.characters.some(ch => ch.newsRole === NewsRole.EDITOR);

		const query = this.newsRepo.createQueryBuilder('news')
			.innerJoinAndSelect('news.owner', 'owner')
			.innerJoinAndSelect('owner.server', 'server')
			.innerJoinAndSelect('owner.user', 'user')
			.innerJoinAndSelect('news.category', 'category')
			.leftJoinAndSelect('news.image', 'image')
			.where('news.id = :id', { id });

		if (!isEditor) {
			query.andWhere('(:userId IS NULL OR user.id = :userId)', { userId: user?.id || null });
		}

		const article = await query
			.select([ 'news', 'category.name', 'owner.id', 'owner.name', 'server.name', 'owner.newsPseudonym', 'image.id' ])
			.getOne();

		if (!article) {
			throw new NotFoundException('Article not found');
		}

		return this.toArticle(article, user);
	}

	async getMyArticles(characterId: number, user: UserInfo): Promise<NewsArticleDto[]> {
		if (!user.characters.some(ch => ch.id === characterId && ch.verified)) {
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

	async getSubmittedArticles(user: UserInfo): Promise<NewsArticleDto[]> {
		if (!user.characters.find(ch => ch.newsRole === NewsRole.EDITOR)) {
			throw new ForbiddenException('This function can only be accessed by editors');
		}

		const articles = await this.newsRepo.createQueryBuilder('news')
			.innerJoinAndSelect('news.owner', 'owner')
			.innerJoinAndSelect('owner.server', 'server')
			.innerJoinAndSelect('news.category', 'category')
			.where('news.status = :status', { status: NewsStatus.SUBMITTED })	
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
			const category = await em.getRepository(NewsCategory).findOneBy({ id: 1 });

			if (!category) {
				throw new Error('No news category found');
			}

			const article = newsRepo.create({
				owner: author,
				category, // temp
				slug: crypto.randomUUID(),
			});

			await this.mergeArticleFromDto(em, article, articleDto, user);
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

			await this.mergeArticleFromDto(em, article, articleDto, user);
			await newsRepo.save(article);
			return article;
		});

		return this.toArticle(articleEntity, user);
	}

	private async mergeArticleFromDto(em: EntityManager, article: News, articleDto: NewsArticleDto, user: UserInfo): Promise<void> {
		article.title = articleDto.title;
		article.subtitle = articleDto.subtitle;
		article.summary = articleDto.summary;
		article.content = articleDto.content;

		if (article.status === NewsStatus.PUBLISHED) {
			if (articleDto.status !== NewsStatus.PUBLISHED) {
				throw new BadRequestException('Cannot unpublish a published article');
			}
		} else {
			article.status = articleDto.status;
		}

		if (article.status === NewsStatus.PUBLISHED) {
			// check if we need to set the slug
			const newSlug = slugify(article.title).toLowerCase();

			if (newSlug !== article.slug) {
				article.slug = await this.getUniqueSlug(em, article, newSlug);
			}

			if (!article.publishedAt) {
				article.publishedAt = new Date();
			}
		}

		if (user.characters.find(ch => ch.newsRole === NewsRole.EDITOR)) {
			if (!articleDto.imageId) {
				article.image = null;
			} else {
				const image = await this.imageRepo.findOne({
					where: {
						id: articleDto.imageId,
					},
					select: [ 'id' ]
				});

				if (!image) {
					throw new NotFoundException('Image not found');
				}

				article.image = image;
			}
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
			summary: article.summary,
			content: article.content,
			category: article.category.name,
			imageId: article.image ? article.image.id : null,
			publishedAt: article.publishedAt ? article.publishedAt.getTime() : null,
			author: {
				name: article.owner.name,
				server: article.owner.server.name,
				pseudonym: article.owner.newsPseudonym || article.owner.name,
			},
		};
	}

	async getArticleImages(articleId: number, user: UserInfo): Promise<ImageSummaryDto[]> {
		const article = await this.newsRepo.createQueryBuilder('news')
				.innerJoinAndSelect('news.owner', 'owner')
				.where('news.id = :id', { id: articleId })	
				.select([ 'news.id', 'news.content', 'news.status', 'owner.id' ])
				.getOne();

		if (!article || !this.canEdit(article, user)) {
			throw new ForbiddenException('Cannot edit this article');
		}

		const doc = parse(article.content);
		const images = doc.querySelectorAll('img');
		const imageRegex = new RegExp(`^${s3Configuration.publicRootUrl}\\/\\d+\\/([0-9a-z]+)\\/.*$`);
		const hashes: string[] = [];

		images.forEach(image => {
			const src = image.getAttribute('src');

			if (!src) {
				return;
			}

			const match = imageRegex.exec(src);

			if (match) {
				hashes.push(match[1]);
			}
		});

		return (await this.imageRepo.find({
			where: {
				hash: In(hashes),
			},
			order: { createdAt: 'ASC' },
			relations: [ 'owner', 'owner.server' ],
		})).map(image => this.imagesService.toImageSummaryDto(image))
	}

	private canEdit(article: News, user?: UserInfo): boolean {
		if (!user) {
			return false;
		}

		if (user.characters.some(ch => ch.newsRole === NewsRole.EDITOR)) {
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
