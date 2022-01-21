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

	private readonly NEWS_SITE = 'https://newsarchive.kryst.company/';
	
	private readonly CURRENT_NEWS_SITE = 'https://news.kryst.company/';
	
	constructor(
		private httpService: HttpService,
	) { }

	async fetchNews(): Promise<NewsDto[]> {
		// Parse Carrd page
		const page = await this.httpService.get<string>(this.NEWS_SITE).toPromise();
		const doc = parse(page.data);
		const latestIssues = doc.querySelectorAll('.inner section').reverse();

		return latestIssues.slice(0, SharedConstants.MAX_NEWS_ENTRIES).map((issue, index) => {
			const title = issue.querySelector('h2').textContent;
			const content = issue.querySelector('h2 + p').textContent;
			const author = issue.querySelector('h2 + p + div.container').querySelector('u').textContent.replace(/^By /, '');
			const anchor = issue.id.replace(/-section$/, '');
			const link = index === 0 ? this.CURRENT_NEWS_SITE : `${this.NEWS_SITE}#${anchor}}`;
			const image = this.getImageUrl(issue.querySelector('img'));
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
		});
	}

	private getImageUrl(image: HTMLElement): string {
		const imageUrl = image.getAttribute('data-src') || image.getAttribute('src')!;

		if (imageUrl.startsWith('https://')) {
			return imageUrl;
		}

		return `${this.NEWS_SITE}${imageUrl}`;
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

		console.log(year);
		return year;
	}
}