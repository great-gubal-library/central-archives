import { NewsDto } from '@app/shared/dto/news/news.dto';
import { EventDto } from '@app/shared/dto/events/event.dto';
import axios from 'axios';

export default class API {
  private readonly axios = axios.create({ baseURL: '/api/v1/' });

  async getNews(): Promise<NewsDto[]> {
    return (await this.axios.get<NewsDto[]>('news')).data;
  }

  async getEvents(): Promise<EventDto[]> {
    return (await this.axios.get<EventDto[]>('events')).data;
  }
}
