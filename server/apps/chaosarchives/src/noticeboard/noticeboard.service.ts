import { UserInfo } from '@app/auth/model/user-info';
import { Character, NoticeboardItem } from '@app/entity';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { NoticeboardItemSummaryDto } from '@app/shared/dto/noticeboard/noticeboard-item-summary.dto';
import { NoticeboardItemDto } from '@app/shared/dto/noticeboard/noticeboard-item.dto';
import html from '@app/shared/html';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class NoticeboardService {
  constructor(
    private connection: Connection,
    @InjectRepository(NoticeboardItem) private noticeboardItemRepo: Repository<NoticeboardItem>,
  ) {}

  async getNoticeboardItem(id: number, user?: UserInfo): Promise<NoticeboardItemDto> {
    const noticeboardItem = await this.noticeboardItemRepo
      .createQueryBuilder('noticeboardItem')
      .innerJoinAndSelect('noticeboardItem.owner', 'character')
      .innerJoinAndSelect('character.user', 'user')
      .innerJoinAndSelect('character.server', 'server')
      .where('noticeboardItem.id = :id', { id })
      .select(['noticeboardItem', 'character.id', 'character.name', 'user.id', 'server.name'])
      .getOne();

    if (!noticeboardItem) {
      throw new NotFoundException('Noticeboard item not found');
    }

    return new NoticeboardItemDto({
      id: noticeboardItem.id,
      mine: user ? noticeboardItem.owner.user.id === user.id : false,
      author: noticeboardItem.owner.name,
      authorServer: noticeboardItem.owner.server.name,
      title: noticeboardItem.title,
      content: noticeboardItem.content,
      createdAt: noticeboardItem.createdAt!.getTime(),
      location: noticeboardItem.location,
    });
  }

  async createNoticeboardItem(noticeboardItemDto: NoticeboardItemDto & { id: undefined }, user: UserInfo): Promise<IdWrapper> {
    const storyEntity = await this.connection.transaction(async (em) => {
      const character = await em.getRepository(Character).findOne({
        where: {
          name: noticeboardItemDto.author,
          server: {
            name: noticeboardItemDto.authorServer,
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
        throw new BadRequestException(`Author character "${noticeboardItemDto.author}" not found`);
      }

      const noticeboardItemRepo = em.getRepository(NoticeboardItem);

      const noticeboardItem = noticeboardItemRepo.create({
        owner: {
          id: character.id,
        },
        title: noticeboardItemDto.title,
        content: html.sanitize(noticeboardItemDto.content),
        location: noticeboardItemDto.location,
      });

      return noticeboardItemRepo.save(noticeboardItem);
    });

    return {
      id: storyEntity.id,
    };
  }

  async editNoticeboardItem(noticeboardItemDto: NoticeboardItemDto & { id: number }, user: UserInfo): Promise<void> {
    await this.connection.transaction(async (em) => {
      const noticeboardItemRepo = em.getRepository(NoticeboardItem);
      const noticeboardItem = await noticeboardItemRepo
        .createQueryBuilder('noticeboardItem')
        .innerJoinAndSelect('noticeboardItem.owner', 'character')
        .innerJoinAndSelect('character.user', 'user')
        .where('noticeboardItem.id = :id', { id: noticeboardItemDto.id })
        .andWhere('user.id = :userId', { userId: user.id })
        .select(['noticeboardItem'])
        .getOne();

      if (!noticeboardItem) {
        throw new NotFoundException('Noticeboard item not found');
      }

      Object.assign(noticeboardItem, {
        title: noticeboardItemDto.title,
        content: html.sanitize(noticeboardItemDto.content),
        location: noticeboardItemDto.location,
      });

      await noticeboardItemRepo.save(noticeboardItem);
    });
  }

  async deleteNoticeboardItem(id: number, user: UserInfo): Promise<void> {
    await this.connection.transaction(async (em) => {
      const noticeboardItemRepo = em.getRepository(NoticeboardItem);
      const noticeboardItem = await noticeboardItemRepo
        .createQueryBuilder('noticeboardItem')
        .innerJoinAndSelect('noticeboardItem.owner', 'character')
        .innerJoinAndSelect('character.user', 'user')
        .where('noticeboardItem.id = :id', { id })
        .andWhere('user.id = :userId', { userId: user.id })
        .select(['noticeboardItem.id'])
        .getOne();

      if (!noticeboardItem) {
        throw new NotFoundException('Noticeboard item not found');
      }

      await noticeboardItemRepo.softRemove(noticeboardItem);
    });
  }

  async getNoticeboardItemList(params: { characterId?: number; limit?: number }): Promise<NoticeboardItemSummaryDto[]> {
    const query = this.noticeboardItemRepo
      .createQueryBuilder('noticeboardItem')
      .innerJoinAndSelect('noticeboardItem.owner', 'character')
      .orderBy('noticeboardItem.createdAt', 'DESC')
      .select(['noticeboardItem.id', 'character.name', 'noticeboardItem.title', 'noticeboardItem.createdAt', 'noticeboardItem.location'])
      .limit(params.limit);

    if (params.characterId) {
      query.where('character.id = :characterId', {
        characterId: params.characterId,
      });
    }

    const noticeboardItems = await query.getMany();

    return noticeboardItems.map((noticeboardItem) => ({
      id: noticeboardItem.id,
      title: noticeboardItem.title,
      author: noticeboardItem.owner.name,
      createdAt: noticeboardItem.createdAt!.getTime(),
      location: noticeboardItem.location,
    }));
  }
}
