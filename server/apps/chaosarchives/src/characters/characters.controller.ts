import { AddCharacterRequestDto } from '@app/shared/dto/characters/add-character-request.dto';
import { CharacterContentDto } from '@app/shared/dto/characters/character-content.dto';
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { CharacterRefreshResultDto } from '@app/shared/dto/characters/character-refresh-result.dto';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { ImageDto } from '@app/shared/dto/image/image.dto';
import { NewProfileDto } from '@app/shared/dto/main-page/new-profile.dto';
import { SessionCharacterDto } from '@app/shared/dto/user/session-character.dto';
import { Role } from '@app/shared/enums/role.enum';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RoleRequired } from '../auth/role-required.decorator';
import { UserInfo } from '../auth/user-info';
import { ImagesService } from '../images/images.service';
import { StoriesService } from '../stories/stories.service';
import { CharactersService } from './characters.service';

@Controller('characters')
export class CharactersController {
  constructor(
    private charactersService: CharactersService,
    private storiesService: StoriesService,
    private imagesService: ImagesService,
  ) {}

  @Get('profile/:server/:name')
  @UseGuards(OptionalJwtAuthGuard)
  async getCharacterProfile(
    @Param('name') name: string,
    @Param('server') server: string,
    @CurrentUser() user?: UserInfo,
  ): Promise<CharacterProfileDto> {
    return this.charactersService.getCharacterProfile(name, server, user);
  }

  @Put('profile')
  @RoleRequired(Role.USER)
  async saveCharacter(@Body() profile: CharacterProfileDto, @CurrentUser() user: UserInfo): Promise<void> {
    await this.charactersService.saveCharacter(profile, user);
  }

  @Get()
  async getCharacterList(): Promise<NewProfileDto[]> {
    return this.charactersService.getCharacterList();
  }

  @Post()
  @RoleRequired(Role.USER)
  async addAccountCharacter(
    @Body() request: AddCharacterRequestDto,
    @CurrentUser() user: UserInfo,
  ): Promise<SessionCharacterDto> {
    return this.charactersService.addAccountCharacter(request, user);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refreshCharacter(
    @Body() characterId: IdWrapper,
    @CurrentUser() user: UserInfo,
  ): Promise<CharacterRefreshResultDto> {
    return this.charactersService.refreshCharacter(characterId, user);
  }

  @Get(':id/content')
  async getCharacterContent(@Param('id', ParseIntPipe) characterId: number): Promise<CharacterContentDto> {
    const [stories, images] = await Promise.all([
      this.storiesService.getStoryList({ characterId }),
      this.imagesService.getImages({ characterId }),
    ]);

    return { stories, images };
  }

  @Get(':id/my-images')
  @RoleRequired(Role.USER)
  async getMyImages(
    @Param('id', ParseIntPipe) characterId: number,
    @CurrentUser() user: UserInfo,
  ): Promise<ImageDto[]> {
    return this.imagesService.getMyImages(characterId, user);
  }
}
