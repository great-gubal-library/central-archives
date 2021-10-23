import { ImageDescriptionDto } from '@app/shared/dto/image/image-desciption.dto';
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { ImageUploadRequestDto } from '@app/shared/dto/image/image-upload-request.dto';
import { ImageDto } from '@app/shared/dto/image/image.dto';
import { ImagesFilterDto } from '@app/shared/dto/image/images-filter.dto';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { Role } from '@app/shared/enums/role.enum';
import {
  BadRequestException,
  Body,
  Controller, Get,
  Param,
  ParseIntPipe,
  Post, Put, Query, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { RoleRequired } from '../auth/role-required.decorator';
import { UserInfo } from '../auth/user-info';
import { ImagesService } from './images.service';
import { PayloadTooLargeInterceptor } from './payload-too-large.interceptor';

@Controller('images')
export class ImagesController {
  constructor(private imageService: ImagesService) {}

  @Get()
  async getImages(@Query() filter: ImagesFilterDto): Promise<ImageSummaryDto[]> {
    if (filter.category === ImageCategory.UNLISTED) {
      throw new BadRequestException('Invalid category');
    }

    return this.imageService.getImages(filter);
  }

  @Get(':id')
  async getImage(@Param('id', ParseIntPipe) id: number): Promise<ImageDto> {
    return this.imageService.getImage(id);
  }

  @Post()
  @RoleRequired(Role.USER)
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(PayloadTooLargeInterceptor) // Must be after FileInterceptor
  async uploadImage(
		@CurrentUser() user: UserInfo,
    @Body() request: ImageUploadRequestDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageSummaryDto> {
		return this.imageService.uploadImage(
			user,
			request,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Put(':id')
  @RoleRequired(Role.USER)
  async editImage(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: ImageDescriptionDto,
		@CurrentUser() user: UserInfo,
  ): Promise<void> {
		return this.imageService.editImage(id, request, user);
  }
}
