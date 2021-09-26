import { Character } from '@app/entity';
import { HttpService, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import parse from 'node-html-parser';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class CarrdService {
	private readonly ABSOLUTE_URL_REGEX = /^https?:/;

	private readonly URL_IN_CSS_REGEX = /url\('([^']+)'\)/g;

	constructor(private httpService: HttpService,
		@InjectRepository(Character) private characterRepo: Repository<Character>) {}

	async getCharacterCarrdPage(characterId: number): Promise<string> {
		const character = await this.characterRepo.findOne({
			where: {
				id: characterId,
				verifiedAt: Not(IsNull()),
			},
			select: [ 'id', 'carrdProfile' ]
		});

		if (!character) {
			return 'Character not found';
		}

		if (!character.carrdProfile) {
			return 'This character does not have a Carrd profile linked';
		}

		return this.getCharacterPreviewCarrdPage(character.carrdProfile);
	}

	async getCharacterPreviewCarrdPage(carrdProfile: string): Promise<string> {
		const baseUrl = `https://${carrdProfile}.carrd.co/`;
		const html = (await this.httpService.get(baseUrl).toPromise()).data;
		const doc = parse(html);

		// Rewrite image URLs
		for (const img of doc.querySelectorAll('img')) {
			img.setAttribute('src', this.rewriteUrl(baseUrl, img.getAttribute('src') || ''));
		}

		// Rewrite CSS URLs
		for (const style of doc.querySelectorAll('style')) {
			const newContent = style.textContent.replace(this.URL_IN_CSS_REGEX, (_, src) => {
				const newSrc = this.rewriteUrl(baseUrl, src);
				return `url('${newSrc}')`;
			});
			style.textContent = newContent;
		}

		// Inject iframe resizer JavaScript
		const head = doc.querySelector('head');
		head.insertAdjacentHTML('beforeend', "<script src='/js/iframeResizer.contentWindow.min.js'></script>");

		return doc.outerHTML;
	}

	rewriteUrl(baseUrl: string, url: string): string {
		if (!url || url.startsWith('data:') || this.ABSOLUTE_URL_REGEX.test(url)) {
			return url;
		}

		return baseUrl + url.replace(/^\//, '');
	}
}
