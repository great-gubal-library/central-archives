import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { ImageUploadRequestDto } from '@app/shared/dto/image/image-upload-request.dto';
import { ImageDto } from '@app/shared/dto/image/image.dto';
import { ImagesFilterDto } from '@app/shared/dto/image/images-filter.dto';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { Role } from '@app/shared/enums/role.enum';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post, Query, UploadedFile, UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(PayloadTooLargeInterceptor) // Must be after FileInterceptor
  async uploadImage(
		@CurrentUser() user: UserInfo,
    @Body() request: ImageUploadRequestDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageSummaryDto> {
		if (user.role === Role.UNVERIFIED) {
			throw new ForbiddenException();
		}

		return this.imageService.uploadImage(
			user,
			request,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }
}
