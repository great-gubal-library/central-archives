import { AuthService } from "@app/auth/auth.service";
import { UserInfo } from "@app/auth/model/user-info";
import { User } from "@app/entity";
import { User2FAConfirmRequestDto } from "@app/shared/dto/user/2fa/user-2fa-confirm-request.dto";
import { User2FAConfirmResponseDto } from "@app/shared/dto/user/2fa/user-2fa-confirm-response.dto";
import { User2FARemoveRequestDto } from "@app/shared/dto/user/2fa/user-2fa-remove-request.dto";
import { User2FAStatusDto } from "@app/shared/dto/user/2fa/user-2fa-status.dto";
import { Injectable, NotImplementedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class User2FAService {
  constructor(
    private connection: DataSource,
    @InjectRepository(User) private userRepo: Repository<User>,
    private authService: AuthService,
  ) {}

  async get2FAStatus(user: UserInfo): Promise<User2FAStatusDto> {
    throw new NotImplementedException();
  }

  async request2FA(user: UserInfo): Promise<User2FAStatusDto> {
    throw new NotImplementedException();
  }

  async cancel2FA(user: UserInfo): Promise<User2FAStatusDto> {
    throw new NotImplementedException();
  }

  async confirm2FA(
    request: User2FAConfirmRequestDto,
    user: UserInfo,
  ): Promise<User2FAConfirmResponseDto> {
    throw new NotImplementedException();
  }

  async regenerate2FABackupCode(user: UserInfo): Promise<User2FAConfirmResponseDto> {
    throw new NotImplementedException();
  }

  async remove2FA(request: User2FARemoveRequestDto, user: UserInfo): Promise<User2FAStatusDto> {
    throw new NotImplementedException();
  }
}
