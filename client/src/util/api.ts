import { EventDto } from '@app/shared/dto/events/event.dto';
import { NewsDto } from '@app/shared/dto/news/news.dto';
import { UserSignUpResponseDto } from '@app/shared/dto/user/user-sign-up-response.dto';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { UserConfirmEmailDto } from '@app/shared/dto/user/user-confirm-email.dto';
import axios from 'axios';

export default class API {
  private readonly axios = axios.create({ baseURL: '/api/v1/' });

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
}
