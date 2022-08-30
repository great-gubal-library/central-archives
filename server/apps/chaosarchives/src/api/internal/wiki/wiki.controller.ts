import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { RoleRequired } from '@app/auth/decorators/role-required.decorator';
import { OptionalJwtAuthGuard } from '@app/auth/guards/optional-jwt-auth.guard';
import { UserInfo } from '@app/auth/model/user-info';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { WikiPageDto } from '@app/shared/dto/wiki/wiki-page.dto';
import { Role } from '@app/shared/enums/role.enum';
import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { WikiService } from './wiki.service';

@Controller('stories')
export class WikiController {
	constructor(private wikiService: WikiService) { }

	@Get('by-name/:name')
	@UseGuards(OptionalJwtAuthGuard)
	async getWikiPageByName(@Param('name') name: string, @CurrentUser() user?: UserInfo): Promise<WikiPageDto> {
		return this.wikiService.getWikiPageByName(name, user);
	}

	@Get(':id')
	@UseGuards(OptionalJwtAuthGuard)
	async getWikiPageById(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: UserInfo): Promise<WikiPageDto> {
		return this.wikiService.getWikiPageById(id, user);
	}

	@Post()
	@RoleRequired(Role.TRUSTED)
	async createWikiPage(@Body() wikiPage: WikiPageDto, @CurrentUser() user: UserInfo): Promise<IdWrapper> {
		if (wikiPage.id !== undefined) {
			throw new BadRequestException('ID is forbidden for create request');
		}

		return this.wikiService.createWikiPage(wikiPage as WikiPageDto & { id: undefined }, user);
	}

	@Put(':id')
	@RoleRequired(Role.TRUSTED)
	async editWikiPage(@Param('id', ParseIntPipe) id: number, @Body() wikiPage: WikiPageDto, @CurrentUser() user: UserInfo): Promise<void> {
		const wikiPageToEdit = new WikiPageDto({...wikiPage, id}) as WikiPageDto & { id: number };
		await this.wikiService.editWikiPage(wikiPageToEdit, user);
	}

	@Delete(':id')
	@RoleRequired(Role.TRUSTED)
	async deleteWikiPage(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserInfo): Promise<void> {
		await this.wikiService.deleteWikiPage(id, user);
	}
}
