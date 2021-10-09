import { ImageUploadRequestDto } from '@app/shared/dto/image/image-upload-request.dto';
import { ImageDto } from '@app/shared/dto/image/image.dto';
import { Role } from '@app/shared/enums/role.enum';
import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserInfo } from '../auth/user-info';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private imageService: ImagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
		@CurrentUser() user: UserInfo,
    @Body() request: ImageUploadRequestDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageDto> {
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
