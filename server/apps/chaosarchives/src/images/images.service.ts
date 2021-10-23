import { serverConfiguration } from '@app/configuration';
import { Character, Image } from '@app/entity';
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
import { Connection, IsNull, Not, Repository } from 'typeorm';
import { UserInfo } from '../auth/user-info';
import {
  ImageSanitizeError,
  ImageSanitizeResult,
  sanitizeImage
} from '../common/image-lib';
import { hashFile } from '../common/security';
import { StorageService } from './storage.service';

@Injectable()
export class ImagesService {
  constructor(
    private storageService: StorageService,
    private connection: Connection,
    @InjectRepository(Image) private imageRepo: Repository<Image>,
  ) {}

  async getImage(id: number): Promise<ImageDto> {
    const image = await this.imageRepo.createQueryBuilder('image')
      .leftJoinAndSelect('image.owner', 'character')
      .leftJoinAndSelect('character.server', 'server')
      .where('image.id = :id', { id })
      .select(['image', 'character.id', 'character.name', 'server.name'])
      .getOne();

    if (!image || image.category === ImageCategory.UNLISTED) {
      throw new NotFoundException('Image not found');
    }

    return {
      id: image.id,
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
      credits: image.credits
    };
  }

  async getImages(filter: ImagesFilterDto): Promise<ImageSummaryDto[]> {
    const { characterId, limit, category } = filter;
    const query = this.imageRepo.createQueryBuilder('image')
      .leftJoinAndSelect('image.owner', 'character');

    if (characterId) {
      query.andWhere('character.id = :characterId', { characterId });
    }

    if (category) {
      query.andWhere('image.category = :category', { category });
    } else {
      query.andWhere('image.category <> :category', { category: ImageCategory.UNLISTED });
    }

    if (limit) {
      query.limit(limit);
    }
      
    const images = await query.orderBy('image.createdAt', 'DESC')
      .limit(limit)
      .select(['image', 'character.id'])
      .getMany();

    return images.map(image => ({
      id: image.id,
      url: this.storageService.getUrl(`${image.owner.id}/${image.hash}/${image.filename}`),
      thumbUrl: this.storageService.getUrl(`${image.owner.id}/${image.hash}/thumb_${image.filename}`),
      filename: image.filename,
      width: image.width,
      height: image.height,
      title: image.title,
      createdAt: image.createdAt!.getTime(),
    }));
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
          select: ['id'],
        });

        if (!character) {
          throw new BadRequestException('Invalid character ID');
        }

        // Replace characters forbidden in Windows and Unix filenames
        const filename = origFilename.replace(/[<>:"/\\|?*]/g, '_');

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
            owner: character,
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
        const image = await em.getRepository(Image).save({
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

        return {
          id: image.id,
          url: this.storageService.getUrl(path),
          thumbUrl: this.storageService.getUrl(thumbPath),
          filename,
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
      const image = await imageRepo.findOne({
        where: {
          id,
          character: {
            user: {
              id: user.id
            }
          }
        }
      });

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

      await imageRepo.save(image);
    });
  }
}
