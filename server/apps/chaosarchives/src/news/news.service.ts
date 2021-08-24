import { Injectable } from '@nestjs/common';
import { NewsEntry } from './dto/NewsEntry';

@Injectable()
export class NewsService {
	async getNews(): Promise<NewsEntry[]> {
		return [];
	}
}
