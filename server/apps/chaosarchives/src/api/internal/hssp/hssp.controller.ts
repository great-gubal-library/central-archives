import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { JwtFormAuthGuard } from '@app/auth/guards/jwt-form-auth.guard';
import { UserInfo } from '@app/auth/model/user-info';
import { HsspRequestDto } from '@app/shared/dto/hssp/hssp-request.dto';
import { Body, Controller, ForbiddenException, Header, Headers, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { HsspService } from './hssp.service';
import { serverConfiguration } from '@app/configuration';

const ALLOWED_ORIGINS = [...Object.values(serverConfiguration.frontendRoot), serverConfiguration.newsRoot];

// Horrible Site Switching Protocol
@Controller('hssp')
export class HsspController {
  constructor(private service: HsspService) {}

  @Post()
  @UseGuards(JwtFormAuthGuard)
  @Header('Content-Type', 'text/html; charset=utf-8')
  @HttpCode(HttpStatus.OK)
  async redirect(
    @Body() request: HsspRequestDto,
    @CurrentUser() user: UserInfo,
    @Headers('Origin') origin: string,
  ): Promise<string> {
    if (!ALLOWED_ORIGINS.includes(origin)) {
      throw new ForbiddenException('Invalid origin');
    }

    return this.service.redirect(request, user);
  }
}
