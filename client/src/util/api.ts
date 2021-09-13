import { EventDto } from '@app/shared/dto/events/event.dto';
import { NewsDto } from '@app/shared/dto/news/news.dto';
import { LoginResponseDto } from '@app/shared/dto/user/login-response.dto';
import { UserConfirmEmailDto } from '@app/shared/dto/user/user-confirm-email.dto';
import { UserLogInDto } from '@app/shared/dto/user/user-log-in.dto';
import { UserSignUpResponseDto } from '@app/shared/dto/user/user-sign-up-response.dto';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { SessionDto } from 'app/../server/libs/shared/src/dto/user/session.dto';
import axios from 'axios';
import { LocalStorage } from 'quasar';

export default class API {
  private readonly axios = axios.create({ baseURL: '/api/v1/' });
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

  async getNews(): Promise<NewsDto[]> {
    return (await this.axios.get<NewsDto[]>('news')).data;
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

  async getSession(): Promise<SessionDto> {
    if (!this.accessToken) {
      throw new Error();
    }

    return (await this.axios.get<SessionDto>('user/session', {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    })).data;
  }
}
