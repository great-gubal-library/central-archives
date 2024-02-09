import APITransport from './api-transport';
import { User2FAStatusDto } from '@app/shared/dto/user/2fa/user-2fa-status.dto';
import { User2FAConfirmRequestDto } from '@app/shared/dto/user/2fa/user-2fa-confirm-request.dto';
import { User2FAConfirmResponseDto } from '@app/shared/dto/user/2fa/user-2fa-confirm-response.dto';
import { User2FARemoveRequestDto } from '@app/shared/dto/user/2fa/user-2fa-remove-request.dto';

// Client for the user 2FA settings API.
export default class User2FAAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('user/2fa');
  }

  async getStatus(): Promise<User2FAStatusDto> {
    return this.transport.authGet('');
  }

  async request(): Promise<User2FAStatusDto> {
    return this.transport.authPut('', {});
  }

  async cancel(): Promise<User2FAStatusDto> {
    return this.transport.authDelete('');
  }

  async confirm(request: User2FAConfirmRequestDto): Promise<User2FAConfirmResponseDto> {
    return this.transport.authPost('confirm', request);
  }

  async regenerateBackupCode(request: User2FARemoveRequestDto): Promise<User2FAConfirmResponseDto> {
    return this.transport.authPost('backup-code', request);
  }

  async remove(request: User2FARemoveRequestDto): Promise<User2FAStatusDto> {
    return this.transport.authPost('remove', request);
  }
}
