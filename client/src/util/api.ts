import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { EventDto } from '@app/shared/dto/events/event.dto';
import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import { NewProfileDto } from '@app/shared/dto/main-page/new-profile.dto';
import { ForgotPasswordRequestDto } from '@app/shared/dto/user/forgot-password-request.dto';
import { LoginResponseDto } from '@app/shared/dto/user/login-response.dto';
import { SessionDto } from '@app/shared/dto/user/session.dto';
import { UserConfirmEmailDto } from '@app/shared/dto/user/user-confirm-email.dto';
import { UserLogInDto } from '@app/shared/dto/user/user-log-in.dto';
import { UserSignUpResponseDto } from '@app/shared/dto/user/user-sign-up-response.dto';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { VerificationStatusDto } from '@app/shared/dto/user/verification-status.dto';
import { VerifyCharacterDto } from '@app/shared/dto/user/verify-character.dto';
import axios from 'axios';
import { LocalStorage } from 'quasar';

const API_PREFIX = '/api/v1/';

export default class API {
  readonly prefix = API_PREFIX;

  private readonly axios = axios.create({ baseURL: API_PREFIX });
  private accessToken: string | null = null;

  constructor() {
    this.accessToken = LocalStorage.getItem('accessToken');
  }

  hasAccessToken() {
    return this.accessToken !== null;
  }

  setAccessToken(accessToken: string | null) {
    this.accessToken = accessToken;

    if (accessToken) {
      LocalStorage.set('accessToken', accessToken);
    } else {
      LocalStorage.remove('accessToken');
    }
  }

  async getMainPageContent(): Promise<MainPageContentDto> {
    return (await this.axios.get<MainPageContentDto>('main-page')).data;
  }

  async getEvents(): Promise<EventDto[]> {
    return (await this.axios.get<EventDto[]>('events')).data;
  }

  async signUp(signupData: UserSignUpDto): Promise<UserSignUpResponseDto> {
    return (await this.axios.post<UserSignUpResponseDto>('user/signup', signupData)).data;
  }

  async confirmEmail(confirmData: UserConfirmEmailDto): Promise<void> {
    await this.axios.post<UserSignUpResponseDto>('user/confirm-email', confirmData);
  }

  async logIn(loginData: UserLogInDto): Promise<LoginResponseDto> {
    return (await this.axios.post<LoginResponseDto>('user/login', loginData)).data;
  }

  async forgotPassword(forgotPasswordData: ForgotPasswordRequestDto): Promise<void> {
    await this.axios.post<void>('user/forgot-password', forgotPasswordData);
  }

  async getSession(): Promise<SessionDto> {
    // TODO: Refactor
    if (!this.accessToken) {
      throw new Error();
    }

    return (await this.axios.get<SessionDto>('user/session', {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    })).data;
  }

  async getVerificationStatus(): Promise<VerificationStatusDto> {
    if (!this.accessToken) {
      throw new Error();
    }

    return (await this.axios.get<VerificationStatusDto>('user/verification-status', {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    })).data;
  }

  async verifyCharacter(characterData: VerifyCharacterDto): Promise<void> {
    if (!this.accessToken) {
      throw new Error();
    }

    return (await this.axios.post<void>('user/verify-character', characterData, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    })).data;
  }

  // Character profile
  async getCharacterProfile(name: string, server: string): Promise<CharacterProfileDto> {
    const options = !this.accessToken ? {} : {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    };
    return (await this.axios.get<CharacterProfileDto>(`characters/profile/${server}/${name}`, options)).data;
  }

  async getCharacterProfiles(): Promise<NewProfileDto[]> {
    return (await this.axios.get<NewProfileDto[]>('characters')).data;
  }

  async saveCharacter(character: CharacterProfileDto): Promise<void> {
    if (!this.accessToken) {
      throw new Error();
    }

    await this.axios.put<void>('characters/profile', character, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    });
  }
}
