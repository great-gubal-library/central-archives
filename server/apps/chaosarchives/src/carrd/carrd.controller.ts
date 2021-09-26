import { Controller, Get, Header, Param } from '@nestjs/common';
import { CarrdService } from './carrd.service';

@Controller('carrd')
export class CarrdController {
	constructor(private carrdService: CarrdService) {}

	@Get('character/:id')
	@Header('Content-Type', 'text/html; charset=utf-8')
	async getCharacterCarrdPage(@Param('id') characterId: number): Promise<string> {
		return this.carrdService.getCharacterCarrdPage(characterId);
	}
	
	@Get('character/preview/:profile')
	@Header('Content-Type', 'text/html; charset=utf-8')
	async getCharacterPreviewCarrdPage(@Param('profile') carrdProfile: string): Promise<string> {
		return this.carrdService.getCharacterPreviewCarrdPage(carrdProfile);
	}
}
