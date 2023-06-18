import { UserInfo } from '@app/auth/model/user-info';
import { serverConfiguration } from '@app/configuration';
import { Character, Event, Image } from '@app/entity';
import { hashFile } from '@app/security';
import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';
import { ImageDescriptionDto } from '@app/shared/dto/image/image-desciption.dto';
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { ImageUploadRequestDto } from '@app/shared/dto/image/image-upload-request.dto';
import { ImageDto } from '@app/shared/dto/image/image.dto';
import { ImagesFilterDto } from '@app/shared/dto/image/images-filter.dto';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { ImageFormat } from '@app/shared/enums/image-format.enum';
import html from '@app/shared/html';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { escapeForLike } from 'apps/chaosarchives/src/common/db';
import utils from 'apps/chaosarchives/src/common/utils';
import { Connection, EntityManager, IsNull, Not, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  ImageSanitizeError,
  ImageSanitizeResult,
  sanitizeImage
} from '../../../common/image-lib';
import { StorageService } from './storage.service';

@Injectable()
export class ImagesService {
  constructor(
    private storageService: StorageService,
    private connection: Connection,
    @InjectRepository(Image) private imageRepo: Repository<Image>,
    @InjectRepository(Character) private characterRepo: Repository<Character>,
  ) {}


  private toImageDto(image: Image, user?: UserInfo): ImageDto {
    return {
      id: image.id,
      mine: !!user && user.characters.some(character => character.id === image.owner.id),
      url: this.storageService.getUrl(`${image.owner.id}/${image.hash}/${image.filename}`),
      thumbUrl: this.storageService.getUrl(`${image.owner.id}/${image.hash}/thumb_${image.filename}`),
      filename: image.filename,
      width: image.width,
      height: image.height,
      title: image.title,
      description: image.description,
      category: image.category,
      createdAt: image.createdAt!.getTime(),
      author: image.owner.name,
      authorServer: image.owner.server.name,
      credits: image.credits,
      eventId: image.event ? image.event.id : null,
      eventTitle: image.event ? image.event.title : null,
    };
  }

  async getImage(id: number, user?: UserInfo): Promise<ImageDto> {
    const image = await this.imageRepo.createQueryBuilder('image')
      .leftJoinAndSelect('image.owner', 'character')
      .leftJoinAndSelect('image.event', 'event')
      .leftJoinAndSelect('character.server', 'server')
      .where('image.id = :id', { id })
      .select(['image', 'character.id', 'character.name', 'server.name', 'event.id', 'event.title' ])
      .getOne();

    if (!image || image.category === ImageCategory.UNLISTED) {
      throw new NotFoundException('Image not found');
    }

    return this.toImageDto(image, user);
  }

  async getImages(filter: ImagesFilterDto): Promise<PagingResultDto<ImageSummaryDto>> {
    const { searchQuery, characterId, eventId, offset, limit, category } = filter;
    const query = this.imageRepo.createQueryBuilder('image')
      .leftJoinAndSelect('image.owner', 'character')
      .leftJoinAndSelect('character.server', 'server')
      .leftJoinAndSelect('image.event', 'event');

    if (searchQuery) {
      query.andWhere('(image.title LIKE :searchQuery OR character.name LIKE :searchQuery)', {
        searchQuery: `%${escapeForLike(searchQuery)}%`
      });
    }

    if (characterId) {
      query.andWhere('character.id = :characterId', { characterId });
    }

    if (eventId) {
      query.andWhere('event.id = :eventId', { eventId });
    }

    if (category) {
      query.andWhere('image.category = :category', { category });
    } else {
      query.andWhere('image.category <> :category', { category: ImageCategory.UNLISTED });
    }

    if (offset) {
      query.offset(offset);
    }

    if (limit) {
      query.limit(limit);
    }
    
    query.orderBy('image.createdAt', 'DESC')
      .limit(limit)
      .select(['image', 'character.id', 'character.name', 'server.name']);
    
    const [ total, images ] = await Promise.all([ query.getCount(), query.getMany() ]);

    return {
      total,
      data: images.map(image => this.toImageSummaryDto(image))
    };
  }

  toImageSummaryDto(image: Image): ImageSummaryDto {
    return {
      id: image.id,
      url: this.storageService.getUrl(`${image.owner.id}/${image.hash}/${image.filename}`),
      thumbUrl: this.storageService.getUrl(`${image.owner.id}/${image.hash}/thumb_${image.filename}`),
      filename: image.filename,
      owner: image.owner ? image.owner.name : null,
      ownerServer: image.owner?.server ? image.owner.server.name : null,
      description: image.description ? utils.htmlToText(this.stripWikilinks(image.description)) : null,
      width: image.width,
      height: image.height,
      title: image.title,
      createdAt: image.createdAt!.getTime(),
    };
  }

	private stripWikilinks(text: string): string {
		return text.replace(/\[\[(.+?\|)?(.+?)\]\]/g, '$2');
	}

  async getMyImages(characterId: number, user: UserInfo): Promise<ImageDto[]> {
    const isMyCharacter = (await this.characterRepo.count({
      where: {
        id: characterId,
        user: {
          id: user.id
        }
      }
    }) > 0);

    if (!isMyCharacter) {
      throw new NotFoundException('Character not found or is not your character');
    }

    const images = await this.imageRepo.createQueryBuilder('image')
      .leftJoinAndSelect('image.owner', 'character')
      .leftJoinAndSelect('image.event', 'event')
      .leftJoinAndSelect('character.server', 'server')
      .where('character.id = :characterId', { characterId })
      .orderBy('image.createdAt', 'DESC')
      .select(['image', 'character.id', 'character.name', 'server.name', 'event.id', 'event.title'])
      .getMany();

    return images.map(image => this.toImageDto(image, user));
  }

  async uploadImage(
    user: UserInfo,
    request: ImageUploadRequestDto,
    origBuffer: Buffer,
    origFilename: string,
    origMimetype: string,
  ): Promise<ImageSummaryDto> {
    // Validate category and title
    if (request.category !== ImageCategory.UNLISTED && !request.title.trim()) {
      throw new BadRequestException(
        'Title is required for artwork and screenshots',
      );
    }

    // Validate MIME type before doing anything else
    if (origMimetype !== 'image/jpeg' && origMimetype !== 'image/png') {
      throw new BadRequestException('Only JPEG and PNG formats are allowed');
    }

    // Remember uploaded paths in case upload succeeds but then the transaction fails
    const uploadedPaths: string[] = [];

    try {
      return await this.connection.transaction(async (em) => {
        // Validate character ID
        const character = await em.getRepository(Character).findOne({
          where: {
            id: request.characterId,
            verifiedAt: Not(IsNull()),
            user: {
              id: user.id,
            },
          },
          select: ['id', 'name'],
          relations: [ 'server' ],
        });

        if (!character) {
          throw new BadRequestException('Invalid character ID');
        }

        // Replace characters forbidden in Windows and Unix filenames and URLs
        const filename = origFilename.replace(/[<>:"/\\|?*#]/g, '_');

        // Prepare and upload image
        let sanitizeResult: ImageSanitizeResult;

        try {
          sanitizeResult = await sanitizeImage(origBuffer, {
            left: request.thumbLeft,
            top: request.thumbTop,
            width: request.thumbWidth,
          });
        } catch (e) {
          if (e instanceof ImageSanitizeError) {
            throw new BadRequestException(e.message);
          }

          throw e;
        }

        const { buffer, thumb, format, width, height } = sanitizeResult;
        const size = buffer.length;
        const hash = await hashFile(buffer);
        const mimetype =
          format === ImageFormat.PNG ? 'image/png' : 'image/jpeg';

        // Check that this is not a duplicate upload
        const existingImage = await em.getRepository(Image).findOne({
          where: {
            hash,
            owner: {
              id: character.id,
            },
          },
          select: ['id', 'filename'],
        });

        if (existingImage && existingImage.id) {
          throw new ConflictException(
            `You already have an image with the same contents: ${existingImage.filename}`,
          );
        }

        // Check the user still has upload space left
        const maxUploadSpaceMiB = serverConfiguration.maxUploadSpacePerUserMiB;
        const maxUploadSpaceBytes = maxUploadSpaceMiB * 1024 * 1024;
        const currentUploadSpaceBytes = await em
          .getRepository(Image)
          .createQueryBuilder('image')
          .innerJoinAndSelect('image.owner', 'character')
          .innerJoinAndSelect('character.user', 'user')
          .where('user.id = :userId', { userId: user.id })
          .select('SUM(image.size)')
          .getRawOne();

        if (currentUploadSpaceBytes + size > maxUploadSpaceBytes) {
          throw new BadRequestException(
            `You have too much image content stored (maximum is ${maxUploadSpaceMiB})`,
          );
        }

        const path = `${character.id}/${hash}/${filename}`;
        const thumbPath = `${character.id}/${hash}/thumb_${filename}`;

        try {
          await this.storageService.uploadFile(path, buffer, mimetype);
          uploadedPaths.push(path);
          await this.storageService.uploadFile(thumbPath, thumb, mimetype);
          uploadedPaths.push(thumbPath);
        } catch (e) {
          throw new ServiceUnavailableException(
            'Cannot upload file to storage service',
          );
        }

        // Save image in database
        const image = new Image();
        Object.assign(image, {
          owner: character,
          width,
          height,
          size,
          hash,
          filename,
          category: request.category,
          title: request.title,
          description: html.sanitize(request.description),
          credits: request.credits,
          format,
        });
        
        await this.assignImageEvent(em, image, request);
        await em.getRepository(Image).save(image);

        return {
          id: image.id,
          url: this.storageService.getUrl(path),
          thumbUrl: this.storageService.getUrl(thumbPath),
          filename,
          description: utils.htmlToText(this.stripWikilinks(image.description)),
          owner: character.name,
          ownerServer: character.server.name,
          width,
          height,
          title: request.title,
          createdAt: image.createdAt!.getTime(),
        };
      });
    } catch (e) {
      if (uploadedPaths.length > 0) {
        // We uploaded the file before the transaction failed. Delete it.
        try {
          await Promise.all(
            uploadedPaths.map((path) => this.storageService.deleteFile(path)),
          );
        } catch (ex) {
          // Well, what can we do?
        }
      }

      throw e;
    }
  }

  async editImage(id: number, request: ImageDescriptionDto, user: UserInfo): Promise<void> {
    await this.connection.transaction(async em => {
      const imageRepo = em.getRepository(Image);
      const image = await em.getRepository(Image)
        .createQueryBuilder('image')
        .innerJoinAndSelect('image.owner', 'character')
        .leftJoinAndSelect('image.event', 'event')
        .innerJoinAndSelect('character.user', 'user')
        .where('image.id = :id', { id } )
        .andWhere('user.id = :userId', { userId: user.id })
        .select([ 'image', 'event' ])
        .getOne();

      if (!image) {
        throw new NotFoundException('Image not found');
      }

      if (request.category !== ImageCategory.UNLISTED && !request.title.trim()) {
        throw new BadRequestException(
          'Title is required for artwork and screenshots',
        );
      }  
  
      image.title = request.title;
      image.category = request.category;
      image.description = html.sanitize(request.description);
      image.credits = request.credits;

      await this.assignImageEvent(em, image, request);
      await imageRepo.save(image);
    });
  }

  private async assignImageEvent(em: EntityManager, image: Image, request: ImageDescriptionDto) {
    if (!request.eventId) {
      // eslint-disable-next-line no-param-reassign
      image.event = null;
    } else if (!image.event || request.eventId !== image.event.id) {
      const event = await em.getRepository(Event).findOneBy({ id: request.eventId });

      if (!event) {
        throw new BadRequestException('Event not found');
      }

      // eslint-disable-next-line no-param-reassign
      image.event = event;
    }
  }

  async deleteImage(id: number, force: boolean, user: UserInfo): Promise<void> {
		const imageEntity = await this.connection.transaction(async em => {
      const imageRepo = em.getRepository(Image);
      const image = await imageRepo
        .createQueryBuilder('image')
        .innerJoinAndSelect('image.owner', 'character')
        .innerJoinAndSelect('character.user', 'user')
        .where('image.id = :id', { id } )
        .andWhere('user.id = :userId', { userId: user.id })
        .select([ 'image.id', 'image.hash', 'image.filename', 'character.id' ])
        .getOne();

      if (!image) {
        throw new NotFoundException('Image not found');
      }

      if (!force) {
        // Check if the image is used as a banner, and if yes, refuse to delete

        if (await em.getRepository(Character).countBy({
          banner: {
            id: image.id
          },
        }) > 0) {
          throw new ConflictException('This image is in use as a character banner');
        }

        if (await em.getRepository(Event).countBy({
          banner: {
            id: image.id
          },
        }) > 0) {
          throw new ConflictException('This image is in use as an event banner');
        }
      } else {
        // Unlink as a banner

        await em.getRepository(Character).update({
          banner: {
            id: image.id,
          },
        }, {
          banner: null
        } as unknown as QueryDeepPartialEntity<Character>);

        await em.getRepository(Event).update({
          banner: {
            id: image.id,
          },
        }, {
          banner: null
        } as unknown as QueryDeepPartialEntity<Event>);
      }

      // Delete from the database
      await imageRepo.remove(image);
      return image;
    });

    // Delete from storage only if transaction succeeds
    await Promise.all([
      this.storageService.deleteFile(`${imageEntity.owner.id}/${imageEntity.hash}/${imageEntity.filename}`),
      this.storageService.deleteFile(`${imageEntity.owner.id}/${imageEntity.hash}/thumb_${imageEntity.filename}`),
    ]);
  }

  getUrl(image: Image): string {
    return this.storageService.getUrl(`${image.owner.id}/${image.hash}/${image.filename}`);
  }
}
