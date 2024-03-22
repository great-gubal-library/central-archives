import { UserInfo } from '@app/authorization/model/user-info';
import { Character, WikiPage } from '@app/entity';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { WikiPageDto } from '@app/shared/dto/wiki/wiki-page.dto';
import { EditPermission } from '@app/shared/enums/edit-permission.enum';
import html from '@app/shared/html';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import crypto from 'crypto';
import { Connection, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class WikiService {
  constructor(
    private connection: Connection,
    @InjectRepository(WikiPage) private wikiPageRepo: Repository<WikiPage>,
  ) {}

  async getWikiPageById(id: number, user?: UserInfo): Promise<WikiPageDto> {
    return this.getWikiPageInternal('wp.id = :id', { id }, user);
  }

  async getWikiPageByTitle(title: string, user?: UserInfo): Promise<WikiPageDto> {
    return this.getWikiPageInternal('wp.title = :title', { title }, user);
  }

  private async getWikiPageInternal(
    where: string,
    params: { [k: string]: string | number },
    user?: UserInfo,
  ): Promise<WikiPageDto> {
    const wikiPage = await this.wikiPageRepo
      .createQueryBuilder('wp')
      .innerJoinAndSelect('wp.owner', 'character')
      .innerJoinAndSelect('character.user', 'user')
      .innerJoinAndSelect('character.server', 'server')
      .where(where, params)
      .select(['wp', 'character.id', 'character.name', 'user.id', 'server.name'])
      .getOne();

    if (!wikiPage) {
      throw new NotFoundException('Wiki page not found');
    }

    return this.toWikiPageDto(wikiPage, user);
  }

  private toWikiPageDto(wikiPage: WikiPage, user?: UserInfo): WikiPageDto {
    return new WikiPageDto({
      id: wikiPage.id,
      mine: user ? wikiPage.owner.user.id === user.id : false,
      author: wikiPage.owner.name,
      authorServer: wikiPage.owner.server.name,
      title: wikiPage.title,
      content: wikiPage.content,
      createdAt: wikiPage.createdAt!.getTime(),
      editPermission: wikiPage.editPermission,
    });
  }

  async createWikiPage(wikiPageDto: WikiPageDto & { id: undefined }, user: UserInfo): Promise<IdWrapper> {
    const storyEntity = await this.connection.transaction(async (em) => {
      const character = await em.getRepository(Character).findOne({
        where: {
          name: wikiPageDto.author,
          server: {
            name: wikiPageDto.authorServer,
          },
          user: {
            id: user.id,
          },
          verifiedAt: Not(IsNull()),
        },
        relations: ['server'],
        select: ['id'],
      });

      if (!character) {
        throw new BadRequestException(`Author character "${wikiPageDto.author}" not found`);
      }

      const wikiPageRepo = em.getRepository(WikiPage);

      const wikiPage = wikiPageRepo.create({
        owner: {
          id: character.id,
        },
        title: wikiPageDto.title,
        content: html.sanitize(wikiPageDto.content),
        editPermission: EditPermission.ME,
      });

      return wikiPageRepo.save(wikiPage);
    });

    return {
      id: storyEntity.id,
    };
  }

  async editWikiPage(wikiPageDto: WikiPageDto & { id: number }, user: UserInfo): Promise<void> {
    await this.connection.transaction(async (em) => {
      const wikiPageRepo = em.getRepository(WikiPage);
      const wikiPage = await wikiPageRepo
        .createQueryBuilder('wp')
        .innerJoinAndSelect('wp.owner', 'character')
        .where('wp.id = :id', { id: wikiPageDto.id })
        .select(['wp', 'character.id'])
        .getOne();

      if (!wikiPage) {
        throw new NotFoundException('Wiki page not found');
      }

      if (wikiPage.editPermission === EditPermission.ME && !user.characters.some((ch) => ch.id === wikiPage.owner.id)) {
        throw new ForbiddenException('You cannot edit this wiki page');
      }

      Object.assign(wikiPage, {
        title: wikiPageDto.title,
        content: html.sanitize(wikiPageDto.content),
      });

      await wikiPageRepo.save(wikiPage);
    });
  }

  async deleteWikiPage(id: number, user: UserInfo): Promise<void> {
    await this.connection.transaction(async (em) => {
      const wikiPageRepo = em.getRepository(WikiPage);
      const wikiPage = await wikiPageRepo
        .createQueryBuilder('wp')
        .innerJoinAndSelect('wp.owner', 'character')
        .innerJoinAndSelect('character.user', 'user')
        .where('wp.id = :id', { id })
        .andWhere('user.id = :userId', { userId: user.id })
        .select(['wp'])
        .getOne();

      if (!wikiPage) {
        throw new NotFoundException('Wiki page not found');
      }

      // Free the name for new wiki pages, but keep the record with a deleted flag
			wikiPage.title = `${crypto.randomUUID()} ${wikiPage.title}`;
      await wikiPageRepo.save(wikiPage);
      await wikiPageRepo.softRemove(wikiPage);
    });
  }
}
