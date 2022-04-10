import { LinkResultDto } from '@app/shared/dto/links/link-result.dto';
import { Controller, Get, Param } from '@nestjs/common';
import { LinksService } from './links.service';

@Controller('links')
export class LinksController {
	constructor(private linksService: LinksService) {}

	@Get('resolve/:name')
	async resolve(@Param('name') name: string): Promise<LinkResultDto[]> {
		return this.linksService.resolve(name);
	}
}
