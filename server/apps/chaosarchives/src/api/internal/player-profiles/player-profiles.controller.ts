import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { UserInfo } from '@app/auth/model/user-info';
import { PlayerProfileDto } from '@app/shared/dto/player-profiles/player-profile.dto';
import { PlayerProfileEditDto } from '@app/shared/dto/player-profiles/player-profile-edit.dto';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { PlayerProfilesService } from './player-profiles.service';
import { RoleRequired } from '@app/auth/decorators/role-required.decorator';
import { Role } from '@app/shared/enums/role.enum';

@Controller('player-profiles')
export class PlayerProfilesController {
	constructor(private service: PlayerProfilesService) {}

  @Get(':id')
  async getPlayerProfile(@Param('id', ParseIntPipe) userId: number): Promise<PlayerProfileDto> {
    return this.service.getPlayerProfile(userId);
  }

  @Put()
	@RoleRequired(Role.USER)
  async updateOwnPlayerProfile(
    @Body() playerProfileDto: PlayerProfileEditDto,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
		await this.service.updateOwnPlayerProfile(playerProfileDto, user);
	}

  @Delete()
	@RoleRequired(Role.USER)
  async deleteOwnPlayerProfile(@CurrentUser() user: UserInfo): Promise<void> {
		await this.service.deleteOwnPlayerProfile(user);
	}
}
