import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { NewsEntry } from './dto/NewsEntry';

@Injectable()
export class NewsService {
	constructor(
    @InjectRedis()
    private readonly redisService: Redis,
	) {}

	async getNews(): Promise<NewsEntry[]> {
		await this.redisService.set("mykey", 10);
		return [];
	}
}
