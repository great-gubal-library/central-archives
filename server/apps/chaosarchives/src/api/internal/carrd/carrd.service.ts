import { Character } from '@app/entity';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import parse from 'node-html-parser';
import { IsNull, Not, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

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
		const baseUrl = carrdProfile.includes('.') ? `https://${carrdProfile}/` : `https://${carrdProfile}.carrd.co/`;
		const html = (await firstValueFrom(this.httpService.get(baseUrl))).data;
		const doc = parse(html);

		// Rewrite image URLs
		for (const img of doc.querySelectorAll('img')) {
			for (const attribute of [ 'src', 'data-src' ]) {
				const value = img.getAttribute(attribute);

				if (value) {
					img.setAttribute(attribute, this.rewriteUrl(baseUrl, value));
				}
			}
		}

		// Rewrite CSS URLs
		for (const style of doc.querySelectorAll('style')) {
			let newContent = style.textContent.replace(this.URL_IN_CSS_REGEX, (_, src) => {
				const newSrc = this.rewriteUrl(baseUrl, src);
				return `url('${newSrc}')`;
			});

			// Remove min-width: var(--viewport-height) to allow iframe content to downsize
			newContent = newContent.replace(/var\(--viewport-height\)/g, 'auto');
			newContent = newContent.replace(/min-height:\s*100vh;/g, '');

			style.textContent = newContent;
		}

		// Rewrite links
		for (const link of doc.querySelectorAll('a')) {
			const href = link.getAttribute('href');

			if (href) {
				if (href.startsWith(baseUrl)) {
					// Some Carrd profiles actually have absolute links to their own address. Relativize them.
					link.setAttribute('href', href.replace(baseUrl, ''));
				} else if (href.startsWith('assets/')) {
					// Sometimes gallery images are implemented as <a href> to asset images
					link.setAttribute('href', this.rewriteUrl(baseUrl, href));
				} else if (this.ABSOLUTE_URL_REGEX.test(href)) {
					// Open external links in new tabs
					link.setAttribute('target', '_blank');
				}
			}
		}

		// Inject iframe resizer JavaScript
		const head = doc.querySelector('head')!;
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
