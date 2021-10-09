import { ImageUploadRequestDto } from '@app/shared/dto/image/image-upload-request.dto';
import { ImageDto } from '@app/shared/dto/image/image.dto';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { ImageFormat } from '@app/shared/enums/image-format.enum';
import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { UserInfo } from '../auth/user-info';
import { hashFile } from '../common/security';

interface ImageResult {
	buffer: Buffer;
	format: ImageFormat;
	width: number;
	height: number;
}

@Injectable()
export class ImagesService {
  async uploadImage(
		user: UserInfo,
    request: ImageUploadRequestDto,
    origBuffer: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<ImageDto> {
		if (request.category !== ImageCategory.UNLISTED && !request.title.trim()) {
			throw new BadRequestException('Title is required for artwork and screenshots');
		}

    const { buffer, format, width, height } = await this.sanitizeImage(origBuffer, mimetype);
		const size = buffer.length;
    const hash = await hashFile(buffer);

    return {
      url: '',
      filename,
      width,
      height,
      size,
      createdAt: Date.now(),
    };
  }

	private async sanitizeImage(buffer: Buffer, mimetype: string): Promise<ImageResult> {
		if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      throw new BadRequestException('Only JPEG and PNG formats are allowed');
    }

    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (
      metadata.format !== 'jpeg' &&
      metadata.format !== 'jpg' &&
      metadata.format !== 'png'
    ) {
      throw new BadRequestException('Only JPEG and PNG formats are allowed');
    }

    const format =
      metadata.format === 'png' ? ImageFormat.PNG : ImageFormat.JPEG;

    if (format === ImageFormat.JPEG) {
      image.jpeg({
        quality: 90,
      });
    }

    const isRotated = metadata.orientation && metadata.orientation >= 5;
    const height = isRotated ? metadata.width : metadata.height;
    const width = isRotated ? metadata.height : metadata.width;

    const result = await image
      .withMetadata({
        orientation: metadata.orientation,
        density: metadata.density,
      })
      .toBuffer();

    return {
      buffer: result,
      format,
      width: width || -1,
      height: height || -1,
    };
	}
}
