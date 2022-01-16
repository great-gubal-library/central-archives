import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { RoleRequired } from '@app/auth/decorators/role-required.decorator';
import { OptionalJwtAuthGuard } from '@app/auth/guards/optional-jwt-auth.guard';
import { UserInfo } from '@app/auth/model/user-info';
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
  Controller, Delete, Get,
  Param, ParseIntPipe,
  Post, Put, Query, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { ImagesService } from './images.service';
import { PayloadTooLargeInterceptor } from './payload-too-large.interceptor';

class DeleteImageParamsDto {
  @IsOptional()
  @Transform((val) => val.value === 'true')
  force: boolean;
}

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
  @UseGuards(OptionalJwtAuthGuard)
  async getImage(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: UserInfo): Promise<ImageDto> {
    return this.imageService.getImage(id, user);
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

  @Delete(':id')
  @RoleRequired(Role.USER)
  async deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Query() queryParams: DeleteImageParamsDto,
		@CurrentUser() user: UserInfo,
  ): Promise<void> {
		return this.imageService.deleteImage(id, queryParams.force, user);
  }
}
