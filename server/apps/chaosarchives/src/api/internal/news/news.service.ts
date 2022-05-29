import { NewsIssueDto } from "@app/shared/dto/news/news-issue.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class NewsService {
	async getLatestIssue(): Promise<NewsIssueDto|null> {
		return null;
	}
}
