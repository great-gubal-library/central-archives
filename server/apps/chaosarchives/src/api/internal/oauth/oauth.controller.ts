import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { OAuthAppService } from './oauth-app.service';
import { CurrentUser } from '@app/authorization/decorators/current-user.decorator';
import { OAuthAppDto } from '@app/shared/dto/oauth/oauth-app.dto';
import { UserInfo } from '@app/authorization/model/user-info';
import { OAuthAppSaveDto } from '@app/shared/dto/oauth/oauth-app-save.dto';
import { ClientSecretDto } from '@app/shared/dto/oauth/client-secret.dto';
import { RoleRequired } from '@app/authorization/decorators/role-required.decorator';
import { Role } from '@app/shared/enums/role.enum';

@Controller('oauth')
export class OAuthController {
  constructor(private appService: OAuthAppService) {}

  @Get('apps')
  @RoleRequired(Role.USER)
  async getMyApps(@CurrentUser() user: UserInfo): Promise<OAuthAppDto[]> {
    return this.appService.getMyApps(user);
  }

  @Get('apps/:id')
  @RoleRequired(Role.USER)
  async getApp(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserInfo): Promise<OAuthAppDto> {
    return this.appService.getApp(id, user);
  }

  @Post('apps')
  @RoleRequired(Role.USER)
  async createApp(@Body() saveDto: OAuthAppSaveDto, @CurrentUser() user: UserInfo): Promise<OAuthAppDto> {
    return this.appService.createApp(saveDto, user);
  }

  @Put('apps/:id')
  @RoleRequired(Role.USER)
  async updateApp(
    @Param('id', ParseIntPipe) id: number,
    @Body() saveDto: OAuthAppSaveDto,
    @CurrentUser() user: UserInfo,
  ): Promise<OAuthAppDto> {
    return this.appService.updateApp(id, saveDto, user);
  }

  @Delete('apps/:id')
  @RoleRequired(Role.USER)
  async deleteApp(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserInfo): Promise<void> {
    await this.appService.deleteApp(id, user);
  }

  @Post('apps/:id/client-secret')
  @RoleRequired(Role.USER)
  async regenerateClientSecret(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserInfo,
  ): Promise<ClientSecretDto> {
    return this.appService.regenerateClientSecret(id, user);
  }
}
