import { NewsDto } from "@app/shared/dto/news/news.dto";
import SharedConstants from "@app/shared/SharedConstants";
import { HttpService, Injectable, Logger } from "@nestjs/common";
import { DateTime } from "luxon";
import parse, { HTMLElement } from "node-html-parser";

const EORZEAN_MONTH_NAMES: string[] = [];

for (const ordinal of [ 'first', 'second', 'third', 'fourth', 'fifth', 'sixth' ]) {
	EORZEAN_MONTH_NAMES.push(`${ordinal} astral moon`);
	EORZEAN_MONTH_NAMES.push(`${ordinal} umbral moon`);
}

@Injectable()
export class LimsaInsiderService {
	private readonly log = new Logger(LimsaInsiderService.name);

	private readonly ARCHIVE_NEWS_SITE = 'https://newsarchive.kryst.company/';
	
	private readonly CURRENT_NEWS_SITE = 'https://news.kryst.company/';
	
	constructor(
		private httpService: HttpService,
	) { }

	async fetchNews(): Promise<NewsDto[]> {
		const result: NewsDto[] = [];

		// Parse Carrd pages
		const [ currentPage, archivePage ] = await Promise.all([
			this.httpService.get<string>(this.CURRENT_NEWS_SITE).toPromise(),
			this.httpService.get<string>(this.ARCHIVE_NEWS_SITE).toPromise(),
		]);

		const currentDoc = parse(currentPage.data);
		const currentIssue = currentDoc.querySelector('.inner');
		result.push(this.parseIssue(currentIssue, 0));

		const archiveDoc = parse(archivePage.data);
		const archiveIssues = archiveDoc.querySelectorAll('.inner section').reverse();
		// ignore latest hidden entry, as it can be wrong compared to the version on news.kryst.company
		result.push(...archiveIssues.slice(1, SharedConstants.MAX_NEWS_ENTRIES)
				.map((issue, index) => this.parseIssue(issue, index + 1)));

		return result;
	}

	private parseIssue(issue: HTMLElement, index: number): NewsDto {
		let selector = 'hr + h2';
		let titleElement = issue.querySelector(selector);

		if (!titleElement) {
			selector = 'h2';
			titleElement = issue.querySelector(selector);
		}

		const title = titleElement.textContent;
		const content = issue.querySelector(`${selector} + p`).textContent;
		const author = issue.querySelector(`${selector} + p + div.container`).querySelector('u').textContent.replace(/^By /, '');
		const anchor = issue.id.replace(/-section$/, '');
		const link = index === 0 ? this.CURRENT_NEWS_SITE : `${this.ARCHIVE_NEWS_SITE}#${anchor}}`;
		const image = this.getImageUrl(issue.querySelector('img'),
				index === 0 ? this.CURRENT_NEWS_SITE : this.ARCHIVE_NEWS_SITE);
		const [ month, day ] = issue.querySelectorAll('.container p');
		const date = (this.eorzeanToGregorianDate(month.textContent, day.textContent) || DateTime.now()).toMillis();

		return {
			title,
			content,
			author,
			link,
			image,
			date,
		};
	}

	private getImageUrl(image: HTMLElement, baseUrl: string): string {
		const imageUrl = image.getAttribute('data-src') || image.getAttribute('src')!;

		if (imageUrl.startsWith('https://')) {
			return imageUrl;
		}

		return `${baseUrl}${imageUrl}`;
	}

	private eorzeanToGregorianDate(month: string, day: string): DateTime|null {
		const monthNumber = EORZEAN_MONTH_NAMES.indexOf(month.toLowerCase()) + 1; // 1 is January

		if (!monthNumber) {
			return null;
		}

		const dayNumber = parseInt(day, 10);

		if (!dayNumber) {
			return null;
		}

		// Guess the year
		const now = DateTime.now();
		let year = DateTime.fromObject({ year: now.year, month: monthNumber, day: dayNumber });
		
		if (year.toMillis() > now.toMillis()) {
			// Publication dates are always in the past
			year = DateTime.fromObject({ year: now.year - 1, month: monthNumber, day: dayNumber });
		}

		return year;
	}
}