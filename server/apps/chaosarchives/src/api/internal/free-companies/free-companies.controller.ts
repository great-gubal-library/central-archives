import { CurrentUser } from '@app/authorization/decorators/current-user.decorator';
import { RoleRequired } from '@app/authorization/decorators/role-required.decorator';
import { OptionalJwtAuthGuard } from '@app/authorization/guards/optional-jwt-auth.guard';
import { UserInfo } from '@app/authorization/model/user-info';
import { CharacterIdWrapper } from '@app/shared/dto/common/character-id-wrapper.dto';
import { FreeCompanySummaryDto } from '@app/shared/dto/fcs/free-company-summary.dto';
import { FreeCompanyDto } from '@app/shared/dto/fcs/free-company.dto';
import { MyFreeCompanySummaryDto } from '@app/shared/dto/fcs/my-free-company-summary.dto';
import { Role } from '@app/shared/enums/role.enum';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { FreeCompaniesService } from './free-companies.service';
import { ClientRegion } from 'apps/chaosarchives/src/common/client-region.decorator';
import { SiteRegion } from '@app/shared/enums/region.enum';

@Controller('free-companies')
export class FreeCompaniesController {
	constructor(
		private freeCompaniesService: FreeCompaniesService,
	) {}

	@Get('my-free-company')
	@RoleRequired(Role.USER)
	async getMyFreeCompany(@Query() characterIdWrapper: CharacterIdWrapper, @CurrentUser() user: UserInfo): Promise<MyFreeCompanySummaryDto|null> {
		return this.freeCompaniesService.getMyFreeCompany(characterIdWrapper, user);
	}

	@Post('my-free-company')
	@RoleRequired(Role.USER)
	@HttpCode(HttpStatus.OK)
	async setFreeCompany(@Body() characterIdWrapper: CharacterIdWrapper, @CurrentUser() user: UserInfo): Promise<MyFreeCompanySummaryDto|null> {
		return this.freeCompaniesService.setFreeCompany(characterIdWrapper, user);
	}

	@Post('my-free-company/unset')
	@RoleRequired(Role.USER)
	@HttpCode(HttpStatus.OK)
	async unsetFreeCompany(@Body() characterIdWrapper: CharacterIdWrapper, @CurrentUser() user: UserInfo): Promise<void> {
		await this.freeCompaniesService.unsetFreeCompany(characterIdWrapper, user);
	}

	@Get()
	async getFreeCompanies(@ClientRegion() region: SiteRegion): Promise<FreeCompanySummaryDto[]> {
		return this.freeCompaniesService.getFreeCompanies(region);
	}

	@Get('profile/:server/:name')
	@UseGuards(OptionalJwtAuthGuard)
	async getFreeCompany(@Param('name') name: string, @Param('server') server: string, @CurrentUser() user?: UserInfo): Promise<FreeCompanyDto> {
		return this.freeCompaniesService.getFreeCompany(name, server, user);
	}

	@Put(':id')
	@RoleRequired(Role.USER)
	async editFreeCompany(@Param('id', ParseIntPipe) id: number, @Body() fc: FreeCompanyDto, @CurrentUser() user: UserInfo): Promise<void> {
		const fcDto = { ...fc, id };
		await this.freeCompaniesService.editFreeCompany(fcDto, user);
	}
}
