import { NewsDto } from "@app/shared/dto/news/news.dto";
import { BadGatewayException, Injectable, Logger } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { DateTime } from "luxon";
import { AxiosError } from 'axios';
import parse, { HTMLElement } from "node-html-parser";
import { firstValueFrom } from "rxjs";

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
		let currentDoc: HTMLElement;
		let archiveDoc: HTMLElement;
		
		try {
			const [ currentPage, archivePage ] = await Promise.all([
				firstValueFrom(this.httpService.get<string>(this.CURRENT_NEWS_SITE)),
				firstValueFrom(this.httpService.get<string>(this.ARCHIVE_NEWS_SITE)),
			]);

			currentDoc = parse(currentPage.data);
			archiveDoc = parse(archivePage.data);
		} catch (e) {
			if ((e as AxiosError).isAxiosError) {
				const ae = e as AxiosError;
				this.log.error(`Error retrieving ${ae.request}`, ae.stack);
				throw new BadGatewayException(ae.message);
			} else {
				throw e;
			}
		}

		const currentIssue = currentDoc.querySelector('.inner');
		result.push(this.parseIssue(currentIssue, 0));

		const archiveIssueSections = archiveDoc.querySelectorAll('.inner section').reverse();
		const seenTitles = new Set([result[0].title.toLowerCase()]);

		for (let i = 1; i < archiveIssueSections.length; i++) {
			// ignore latest hidden entry, as it can be wrong compared to the version on news.kryst.company
			const issue = this.parseIssue(archiveIssueSections[i], i + 1);
			const titleKey = issue.title.toLowerCase();

			if (!seenTitles.has(titleKey)) {
				seenTitles.add(titleKey);
				result.push(issue);
			}
		}

		return result;
	}

	private parseIssue(issue: HTMLElement, index: number): NewsDto {
		let titleSelector = 'hr + h2';
		let titleElement = issue.querySelector(titleSelector);
		
		if (!titleElement) {
				titleSelector = 'h2';
				titleElement = issue.querySelector(titleSelector);
		}

		const title = titleElement.textContent;

		let subtitleSelector = `${titleSelector} + p`;
		let subtitleElement = issue.querySelector(subtitleSelector);

		if (!subtitleElement) {
			subtitleSelector = `${titleSelector} + h3`;
			subtitleElement = issue.querySelector(subtitleSelector);
		}

		const content = issue.querySelector(subtitleSelector).textContent;
		const author = issue.querySelector(`${subtitleSelector} + div.container`).querySelector('u').textContent.replace(/^By /, '');
		const anchor = issue.id.replace(/-section$/, '');
		const link = index === 0 ? this.CURRENT_NEWS_SITE : `${this.ARCHIVE_NEWS_SITE}#${anchor}`;
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