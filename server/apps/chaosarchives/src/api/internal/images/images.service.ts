import { UserInfo } from '@app/auth/model/user-info';
import { serverConfiguration } from '@app/configuration';
import { Character, Community, Event, FreeCompany, Image, Venue } from '@app/entity';
import { hashBuffer } from '@app/security';
import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';
import { BannerCheckResultDto } from '@app/shared/dto/image/banner-check-result.dto';
import { ImageDescriptionDto } from '@app/shared/dto/image/image-desciption.dto';
import { ImageReplaceRequestDto } from '@app/shared/dto/image/image-replace-request.dto';
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { ImageUploadRequestDto } from '@app/shared/dto/image/image-upload-request.dto';
import { ImageDto } from '@app/shared/dto/image/image.dto';
import { ImagesFilterDto } from '@app/shared/dto/image/images-filter.dto';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { ImageFormat } from '@app/shared/enums/image-format.enum';
import html from '@app/shared/html';
import SharedConstants from '@app/shared/SharedConstants';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { escapeForLike } from 'apps/chaosarchives/src/common/db';
import utils from 'apps/chaosarchives/src/common/utils';
import { Connection, EntityManager, FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ImageSanitizeError, ImageSanitizeResult, sanitizeImage } from '../../../common/image-lib';
import { StorageService } from './storage.service';
import { SiteRegion } from '@app/shared/enums/region.enum';

const bannerEntities = Object.freeze([
  {
    entity: Character,
    errorMessage: 'This image is in use as a character banner',
  },
  {
    entity: Event,
    errorMessage: 'This image is in use as an event banner',
  },
  {
    entity: FreeCompany,
    errorMessage: 'This image is in use as a Free Company banner',
  },
  {
    entity: Community,
    errorMessage: 'This image is in use as a community banner',
  },
  {
    entity: Venue,
    errorMessage: 'This image is in use as an event banner',
  },
]);

interface UploadedImageInfo {
  uploadedPaths: string[];
  hash: string;
  filename: string;
  width: number;
  height: number;
  size: number;
  format: string;
  path: string;
  thumbPath: string;
}

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
      mine: !!user && user.characters.some((character) => character.id === image.owner.id),
      url: this.storageService.getUrl(this.getStoragePath(image.owner.id, image.hash, image.filename)),
      thumbUrl: this.storageService.getUrl(this.getThumbnailStoragePath(image.owner.id, image.hash, image.filename)),
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
    const image = await this.imageRepo
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.owner', 'character')
      .leftJoinAndSelect('image.event', 'event')
      .leftJoinAndSelect('character.server', 'server')
      .where('image.id = :id', { id })
      .select(['image', 'character.id', 'character.name', 'server.name', 'event.id', 'event.title'])
      .getOne();

    if (!image || image.category === ImageCategory.UNLISTED) {
      throw new NotFoundException('Image not found');
    }

    return this.toImageDto(image, user);
  }

  async getImages(region: SiteRegion, filter: ImagesFilterDto): Promise<PagingResultDto<ImageSummaryDto>> {
    const { searchQuery, characterId, eventId, offset, limit, category } = filter;
    const query = this.imageRepo
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.owner', 'character')
      .leftJoinAndSelect('character.server', 'server')
      .leftJoinAndSelect('image.event', 'event');

    if (region !== SiteRegion.GLOBAL) {
      query.andWhere('server.region = :region', { region });
    }

    if (searchQuery) {
      query.andWhere('(image.title LIKE :searchQuery OR character.name LIKE :searchQuery)', {
        searchQuery: `%${escapeForLike(searchQuery)}%`,
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

    query
      .orderBy('image.createdAt', 'DESC')
      .limit(limit)
      .select(['image', 'character.id', 'character.name', 'server.name']);

    const [total, images] = await Promise.all([query.getCount(), query.getMany()]);

    return {
      total,
      data: images.map((image) => this.toImageSummaryDto(image)),
    };
  }

  toImageSummaryDto(image: Image): ImageSummaryDto {
    return {
      id: image.id,
      url: this.storageService.getUrl(this.getStoragePath(image.owner.id, image.hash, image.filename)),
      thumbUrl: this.storageService.getUrl(this.getThumbnailStoragePath(image.owner.id, image.hash, image.filename)),
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
    const isMyCharacter =
      (await this.characterRepo.count({
        where: {
          id: characterId,
          user: {
            id: user.id,
          },
        },
      })) > 0;

    if (!isMyCharacter) {
      throw new NotFoundException('Character not found or is not your character');
    }

    const images = await this.imageRepo
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.owner', 'character')
      .leftJoinAndSelect('image.event', 'event')
      .leftJoinAndSelect('character.server', 'server')
      .where('character.id = :characterId', { characterId })
      .orderBy('image.createdAt', 'DESC')
      .select(['image', 'character.id', 'character.name', 'server.name', 'event.id', 'event.title'])
      .getMany();

    return images.map((image) => this.toImageDto(image, user));
  }

  async checkIsBanner(id: number): Promise<BannerCheckResultDto> {
    return this.connection.transaction(async em => {
      const image = await em.getRepository(Image).findOne({
        where: { id },
        select: [ 'id' ],
      });

      if (!image) {
        throw new NotFoundException('Invalid image ID');
      }

      return {
        isBanner: await this.isBanner(em, image),
      };
    });
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
      throw new BadRequestException('Title is required for artwork and screenshots');
    }

    this.validateMimeType(origMimetype);

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
          relations: ['server'],
        });

        if (!character) {
          throw new BadRequestException('Invalid character ID');
        }

        const uploadResult = await this.doSanitizeAndUpload(em, user, character.id, request, origFilename, origBuffer);
        uploadedPaths.push(...uploadResult.uploadedPaths);

        const {
          width,
          height,
          hash,
          filename,
          size,
          format,
          path,
          thumbPath
        } = uploadResult;

        // Save image in database
        const image = new Image();
        Object.assign(image, {
          owner: character,
          width,
          height,
          size,
          hash,
          filename,
          format,
          category: request.category,
          title: request.title,
          description: html.sanitize(request.description),
          credits: request.credits,
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
      // We uploaded the files before the transaction failed. Delete them.
      await this.deleteUploadedFiles(uploadedPaths);
      throw e;
    }
  }

  async replaceImage(
    id: number,
    user: UserInfo,
    request: ImageReplaceRequestDto,
    origBuffer: Buffer,
    origFilename: string,
    origMimetype: string,
  ): Promise<ImageSummaryDto> {
    this.validateMimeType(origMimetype);

    // Remember uploaded paths in case upload succeeds but then the transaction fails
    const uploadedPaths: string[] = [];
    // Remember paths to delete after transaction succeeds
    const originalPaths: string[] = [];

    try {
      const imageSummary = await this.connection.transaction(async (em) => {
        const imageRepo = em.getRepository(Image);
        const image = await imageRepo
          .createQueryBuilder('image')
          .innerJoinAndSelect('image.owner', 'character')
          .innerJoinAndSelect('character.user', 'user')
          .innerJoinAndSelect('character.server', 'server')
          .where('image.id = :id', { id })
          .andWhere('user.id = :userId', { userId: user.id })
          .select(['image', 'character.id', 'character.name', 'server.name' ])
          .getOne();

        if (!image) {
          throw new NotFoundException('Image not found');
        }

        const character = image.owner;
        originalPaths.push(
          this.getStoragePath(character.id, image.hash, image.filename),
          this.getThumbnailStoragePath(character.id, image.hash, image.filename),
        );

        const uploadResult = await this.doSanitizeAndUpload(em, user, character.id, request, origFilename, origBuffer,
          image);
        uploadedPaths.push(...uploadResult.uploadedPaths);

        const {
          width,
          height,
          hash,
          filename,
          size,
          format,
          path,
          thumbPath
        } = uploadResult;

        // Save changes to image in database
        Object.assign(image, {
          width,
          height,
          size,
          hash,
          filename,
          format,
        });

        await imageRepo.save(image);

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
          title: image.title,
          createdAt: image.createdAt!.getTime(),
        };
      });

      // Transaction has succeeded - delete replaced files
      await this.deleteUploadedFiles(originalPaths);

      return imageSummary;
    } catch (e) {
      // We uploaded the files before the transaction failed. Delete them.
      await this.deleteUploadedFiles(uploadedPaths);
      throw e;
    }
  }

  private validateMimeType(mimetype: string) {
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      throw new BadRequestException('Only JPEG and PNG formats are allowed');
    }
  }

  private async doSanitizeAndUpload(
    em: EntityManager,
    user: UserInfo,
    characterId: number,
    request: ImageReplaceRequestDto,
    origFilename: string,
    origBuffer: Buffer,
    existingImage?: Image,
  ): Promise<UploadedImageInfo> {
    const uploadedPaths = [];

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
    const hash = hashBuffer(buffer);
    const mimetype = format === ImageFormat.PNG ? 'image/png' : 'image/jpeg';

    if (existingImage) {
      // Check that the upload result is different from the original
      if (hash === existingImage.hash && filename === existingImage.filename) {
        throw new ConflictException('You are trying to replace this image with the same contents and file name');
      }

      // Check that the image is not used as a banner; if it is, enforce proportions
      if (await this.isBanner(em, existingImage) && width / height < SharedConstants.MIN_BANNER_ASPECT_RATIO) {
        throw new BadRequestException(
          'This image is used as a banner, but the new image is too tall for its width to be a banner');
      }
    }

    // Check that this is not a duplicate upload
    const duplicateImageSearchParams: FindOptionsWhere<Image> = {
      hash,
      owner: {
        id: characterId,
      },
    }

    if (existingImage) {
      duplicateImageSearchParams.id = Not(existingImage.id);
    }

    const duplicateImage = await em.getRepository(Image).findOne({
      where: duplicateImageSearchParams,
      select: ['id', 'filename'],
    });

    if (duplicateImage && duplicateImage.id) {
      throw new ConflictException(`You already have an image with the same contents: ${duplicateImage.filename}`);
    }

    // Check the user still has upload space left
    const maxUploadSpaceMiB = serverConfiguration.maxUploadSpacePerUserMiB;
    const maxUploadSpaceBytes = maxUploadSpaceMiB * 1024 * 1024;
    const currentUploadSpaceBytesQuery = em.getRepository(Image)
      .createQueryBuilder('image')
      .innerJoinAndSelect('image.owner', 'character')
      .innerJoinAndSelect('character.user', 'user')
      .where('user.id = :userId', { userId: user.id });

    if (existingImage) {
      currentUploadSpaceBytesQuery.andWhere('image.id <> :imageId', { imageId: existingImage.id });
    }

    const currentUploadSpaceBytes = await currentUploadSpaceBytesQuery
      .select('SUM(image.size)')
      .getRawOne();

    if (currentUploadSpaceBytes + size > maxUploadSpaceBytes) {
      throw new BadRequestException(`You have too much image content stored (maximum is ${maxUploadSpaceMiB})`);
    }

    const path = this.getStoragePath(characterId, hash, filename);
    const thumbPath = this.getThumbnailStoragePath(characterId, hash, filename);

    try {
      await this.storageService.uploadFile(path, buffer, mimetype);
      uploadedPaths.push(path);
      await this.storageService.uploadFile(thumbPath, thumb, mimetype);
      uploadedPaths.push(thumbPath);
    } catch (e) {
      throw new ServiceUnavailableException('Cannot upload file to storage service');
    }

    return {
      uploadedPaths,
      hash,
      filename,
      width,
      height,
      size,
      format,
      path,
      thumbPath,
    }
  }

  private async deleteUploadedFiles(filePaths: string[]) {
    if (filePaths.length > 0) {
      try {
        await Promise.all(filePaths.map((path) => this.storageService.deleteFile(path)));
      } catch (ex) {
        // Well, what can we do?
      }
    }
  }

  private async isBanner(em: EntityManager, image: Image) {
    const bannerCounts = await Promise.all(bannerEntities.map(
      entityDescription => em.getRepository(entityDescription.entity).countBy({
        banner: {
          id: image.id,
        },
      }))
    );

    return bannerCounts.some(count => count > 0);
  }

  async editImage(id: number, request: ImageDescriptionDto, user: UserInfo): Promise<void> {
    await this.connection.transaction(async (em) => {
      const imageRepo = em.getRepository(Image);
      const image = await imageRepo
        .createQueryBuilder('image')
        .innerJoinAndSelect('image.owner', 'character')
        .leftJoinAndSelect('image.event', 'event')
        .innerJoinAndSelect('character.user', 'user')
        .where('image.id = :id', { id })
        .andWhere('user.id = :userId', { userId: user.id })
        .select(['image', 'event'])
        .getOne();

      if (!image) {
        throw new NotFoundException('Image not found');
      }

      if (request.category !== ImageCategory.UNLISTED && !request.title.trim()) {
        throw new BadRequestException('Title is required for artwork and screenshots');
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
    const imageEntity = await this.connection.transaction(async (em) => {
      const imageRepo = em.getRepository(Image);
      const image = await imageRepo
        .createQueryBuilder('image')
        .innerJoinAndSelect('image.owner', 'character')
        .innerJoinAndSelect('character.user', 'user')
        .where('image.id = :id', { id })
        .andWhere('user.id = :userId', { userId: user.id })
        .select(['image.id', 'image.hash', 'image.filename', 'character.id'])
        .getOne();

      if (!image) {
        throw new NotFoundException('Image not found');
      }

      if (!force) {
        // Check if the image is used as a banner, and if yes, refuse to delete

        for (const entityDescription of bannerEntities) {
          if (
            (await em.getRepository(entityDescription.entity).countBy({
              banner: {
                id: image.id,
              },
            })) > 0
          ) {
            throw new ConflictException(entityDescription.errorMessage);
          }
        }
      } else {
        // Unlink as a banner

        await Promise.all(bannerEntities.map(entityDescription => em.getRepository(entityDescription.entity).update(
          {
            banner: {
              id: image.id,
            },
          },
          {
            banner: null,
          } as unknown as QueryDeepPartialEntity<Character>)));
      }

      // Delete from the database
      await imageRepo.remove(image);
      return image;
    });

    // Delete from storage only if transaction succeeds
    await Promise.all([
      this.storageService.deleteFile(
        this.getStoragePath(imageEntity.owner.id, imageEntity.hash, imageEntity.filename)),
      this.storageService.deleteFile(
        this.getThumbnailStoragePath(imageEntity.owner.id, imageEntity.hash, imageEntity.filename)),
    ]);
  }

  getUrl(image: Image): string {
    return this.storageService.getUrl(this.getStoragePath(image.owner.id, image.hash, image.filename));
  }

  private getStoragePath(characterId: number, hash: string, filename: string) {
    return `${characterId}/${hash}/${filename}`;
  }

  private getThumbnailStoragePath(characterId: number, hash: string, filename: string) {
    return `${characterId}/${hash}/thumb_${filename}`;
  }
}
