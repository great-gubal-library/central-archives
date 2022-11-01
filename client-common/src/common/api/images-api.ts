import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';
import { ImageDescriptionDto } from '@app/shared/dto/image/image-desciption.dto';
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { ImageUploadRequestDto } from '@app/shared/dto/image/image-upload-request.dto';
import { ImageDto } from '@app/shared/dto/image/image.dto';
import { ImagesFilterDto } from '@app/shared/dto/image/images-filter.dto';
import APITransport from './api-transport';

export default class ImagesAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('images');
  }

  async getImage(id: number): Promise<ImageDto> {
    return this.transport.tokenGet<ImageDto>(`${id}`);
  }

  async getImages(filter: ImagesFilterDto): Promise<PagingResultDto<ImageSummaryDto>> {
    return this.transport.tokenGet('', filter as { [k: string]: string | number });
  }

  async uploadImage(request: ImageUploadRequestDto, file: Blob, filename: string): Promise<ImageSummaryDto> {
    const formData = new FormData();
    formData.append('file', file, filename);

    const requestMap = request as unknown as { [k: string]: string | number };
    Object.keys(requestMap).forEach((key) => formData.append(key, `${requestMap[key]}`));

    return this.transport.authPost<ImageSummaryDto>('', formData);
  }

  async deleteImage(id: number, force: boolean): Promise<void> {
    await this.transport.authDelete<void>(`${id}`, { force });
  }

  async saveImage(id: number, details: ImageDescriptionDto): Promise<void> {
    await this.transport.authPut<void>(`${id}`, details);
  }
}
