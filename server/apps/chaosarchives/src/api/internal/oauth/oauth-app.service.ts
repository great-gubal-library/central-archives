import { UserInfo } from '@app/authorization/model/user-info';
import { generateVerificationCode, hashPassword, randomUuid } from '@app/cryptography';
import { Image, OAuthApp, OAuthUserAppConsent } from '@app/entity';
import { OAuthRefreshGrant } from '@app/entity/oauth-refresh-grant.entity';
import { OAuthRequest } from '@app/entity/oauth-request.entity';
import { ClientSecretDto } from '@app/shared/dto/oauth/client-secret.dto';
import { OAuthAppSaveDto } from '@app/shared/dto/oauth/oauth-app-save.dto';
import { OAuthAppDto } from '@app/shared/dto/oauth/oauth-app.dto';
import { AppType } from '@app/shared/enums/oauth/app-type.enum';
import { AuthFlow } from '@app/shared/enums/oauth/auth-flow.enum';
import { validateRedirectUri } from '@app/shared/validation/redirect-uri-validator';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import utils from 'apps/chaosarchives/src/common/utils';
import { DateTime } from 'luxon';
import { DataSource, Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';

@Injectable()
export class OAuthAppService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(OAuthApp) private appRepo: Repository<OAuthApp>,
    @InjectRepository(Image) private imageRepo: Repository<Image>,
    private imagesService: ImagesService,
  ) {}

  async getMyApps(user: UserInfo): Promise<OAuthAppDto[]> {
    const myApps = await this.appRepo.find({
      where: {
        user: {
          id: user.id,
        },
      },
      order: {
        name: 'ASC',
      },
      relations: ['icon', 'icon.owner'],
    });

    return myApps.map((app) => this.toAppDto(app));
  }

  async getApp(id: number, user: UserInfo): Promise<OAuthAppDto> {
    const app = await this.getMyApp(this.appRepo, id, user);
    return this.toAppDto(app);
  }

  async createApp(saveDto: OAuthAppSaveDto, user: UserInfo): Promise<OAuthAppDto> {
    return this.dataSource.transaction(async (em) => {
      const appRepo = em.getRepository(OAuthApp);
      const app = appRepo.create({
        type: saveDto.type,
        clientId: randomUuid(),
        user: {
          id: user.id,
        },
      });
      await this.merge(app, saveDto, user);

      let clientSecret: string | null = null;

      if (app.type === AppType.SERVER) {
        clientSecret = this.generateClientSecret();
        app.clientSecretHash = await hashPassword(clientSecret);
      }

      await appRepo.save(app);

      const dto = this.toAppDto(app);
      dto.clientSecret = clientSecret;
      return dto;
    });
  }

  async updateApp(id: number, saveDto: OAuthAppSaveDto, user: UserInfo): Promise<OAuthAppDto> {
    return this.dataSource.transaction(async (em) => {
      const appRepo = em.getRepository(OAuthApp);
      const app = await this.getMyApp(appRepo, id, user);

      if (app.type !== saveDto.type) {
        throw new BadRequestException('Cannot change app type');
      }

      await this.merge(app, saveDto, user);
      await appRepo.save(app);
      return this.toAppDto(app);
    });
  }

  async regenerateClientSecret(id: number, user: UserInfo): Promise<ClientSecretDto> {
    return this.dataSource.transaction(async (em) => {
      const appRepo = em.getRepository(OAuthApp);
      const app = await this.getMyApp(appRepo, id, user);

      if (app.type !== AppType.SERVER) {
        throw new BadRequestException('Invalid app type');
      }

      const clientSecret = this.generateClientSecret();
      app.clientSecretHash = await hashPassword(clientSecret);
      await appRepo.save(app);
      return { clientSecret };
    });
  }

  private generateClientSecret(): string {
    return 'secret_' + generateVerificationCode();
  }

  private async merge(app: OAuthApp, saveDto: OAuthAppSaveDto, user: UserInfo): Promise<void> {
    app.name = saveDto.name;
    app.description = saveDto.description;
    app.requestableScopes = saveDto.requestableScopes;
    app.active = saveDto.active;

    if (app.type !== AppType.NATIVE && saveDto.enabledFlows.includes(AuthFlow.DEVICE)) {
      throw new BadRequestException('Device flow is only available for native apps');
    }

    app.enabledFlows = saveDto.enabledFlows;
    app.redirectUris = this.validateRedirectUris(saveDto);

    if (!saveDto.iconId) {
      app.icon = null;
    } else if ((app.icon?.id || null) !== saveDto.iconId) {
      const icon = await this.imageRepo.findOne({
        where: {
          id: saveDto.iconId,
          owner: {
            user: {
              id: user.id,
            },
          },
        },
        relations: ['owner'],
      });

      if (!icon) {
        throw new BadRequestException('Invalid icon ID');
      }

      app.icon = icon;
    }
  }

  private validateRedirectUris(saveDto: OAuthAppSaveDto): string[] {
    const type = saveDto.type;
    const redirectUris = saveDto.redirectUris;

    if ((type !== AppType.NATIVE || !saveDto.enabledFlows.includes(AuthFlow.DEVICE)) && redirectUris.length === 0) {
      throw new BadRequestException('Must set at least one redirect URI');
    }

    redirectUris.forEach((redirectUri) => {
      const errorMessage = validateRedirectUri(redirectUri, type);

      if (errorMessage) {
        throw new BadRequestException(errorMessage);
      }
    });

    return redirectUris;
  }

  private async getMyApp(repo: Repository<OAuthApp>, id: number, user: UserInfo): Promise<OAuthApp> {
    const app = await repo.findOne({
      where: {
        id,
        user: {
          id: user.id,
        },
      },
      relations: ['icon', 'icon.owner'],
    });

    if (!app) {
      throw new NotFoundException('App not found');
    }

    return app;
  }

  private toAppDto(app: OAuthApp, clientSecret?: string | null): OAuthAppDto {
    return {
      id: app.id,
      name: app.name,
      description: app.description,
      active: app.active,
      clientId: app.clientId,
      clientSecret: clientSecret || null,
      type: app.type,
      enabledFlows: app.enabledFlows,
      redirectUris: app.redirectUris,
      iconId: app.icon?.id || null,
      iconUrl: app.icon ? this.imagesService.getThumbnailUrl(app.icon) : null,
      requestableScopes: app.requestableScopes,
      createdAt: app.createdAt.getTime(),
      blockedAt: app.blockedAt?.getTime() || null,
      blockReason: app.blockReason,
    };
  }

  async revokeAppTokens(id: number, user: UserInfo): Promise<void> {
    // JWT iat has seconds granularity
    const startOfNextSecond = DateTime.now().startOf('second').plus({ seconds: 1 });
    await utils.delayUntil(startOfNextSecond);

    await this.dataSource.transaction(async (em) => {
      const appRepo = em.getRepository(OAuthApp);
      const app = await this.getMyApp(appRepo, id, user);
      app.tokensValidAfter = startOfNextSecond.toJSDate();
      await appRepo.save(app);

      const refreshGrantRepo = em.getRepository(OAuthRefreshGrant);
      await refreshGrantRepo.softDelete({
        app,
      });
    });
  }

  async deleteApp(id: number, user: UserInfo): Promise<void> {
    return this.dataSource.transaction(async (em) => {
      const appRepo = em.getRepository(OAuthApp);
      const app = await this.getMyApp(appRepo, id, user);

      await em.getRepository(OAuthRefreshGrant).delete({
        app,
      });

      await em.getRepository(OAuthRequest).delete({
        app,
      });

      await em.getRepository(OAuthUserAppConsent).delete({
        app,
      });

      await appRepo.remove(app);
    });
  }
}
