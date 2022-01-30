import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { RoleRequired } from '@app/auth/decorators/role-required.decorator';
import { OptionalJwtAuthGuard } from '@app/auth/guards/optional-jwt-auth.guard';
import { UserInfo } from '@app/auth/model/user-info';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { VenueSummaryDto } from '@app/shared/dto/venues/venue-summary.dto';
import { VenueDto } from '@app/shared/dto/venues/venue.dto';
import { Role } from '@app/shared/enums/role.enum';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { VenuesService } from './venues.service';

@Controller('venues')
export class VenuesController {
	constructor(private venuesService: VenuesService) {}

	@Get()
	async getVenues(): Promise<VenueSummaryDto[]> {
		return this.venuesService.getVenues({});
	}

	@Get('my-venues')
	@RoleRequired(Role.USER)
	async getMyVenues(@CurrentUser() user: UserInfo): Promise<VenueSummaryDto[]> {
		return this.venuesService.getMyVenues(user);
	}

	@Get(':id')
	@UseGuards(OptionalJwtAuthGuard)
	async getVenue(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: UserInfo): Promise<VenueDto> {
		return this.venuesService.getVenue(id, user);
	}

	@Post()
	@RoleRequired(Role.USER)
	async createVenue(@Body() venue: VenueDto, @CurrentUser() user: UserInfo): Promise<IdWrapper> {
		return this.venuesService.createVenue(venue, user);
	}

	@Put(':id')
	@RoleRequired(Role.USER)
	async editVenue(@Param('id', ParseIntPipe) id: number, @Body() venue: VenueDto, @CurrentUser() user: UserInfo): Promise<void> {
		// eslint-disable-next-line no-param-reassign
		venue.id = id;
		await this.venuesService.editVenue(venue, user);
	}
}
