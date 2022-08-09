import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { NoticeboardItemSummaryDto } from '@app/shared/dto/noticeboard/noticeboard-item-summary.dto';
import { NoticeboardItemDto } from '@app/shared/dto/noticeboard/noticeboard-item.dto';
import APITransport from './api-transport';

export default class NoticeboardAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('noticeboard');
  }

  async getNoticeboardItems(params: { characterId?: number }): Promise<NoticeboardItemSummaryDto[]> {
    return this.transport.get<NoticeboardItemSummaryDto[]>('', params);
  }

  async getNoticeboardItem(id: number): Promise<NoticeboardItemDto> {
    return this.transport.tokenGet<NoticeboardItemDto>(`${id}`);
  }

  async createNoticeboardItem(noticeboardItem: NoticeboardItemDto, postOnDiscord: boolean): Promise<IdWrapper> {
    return this.transport.authPost<IdWrapper>('', noticeboardItem, { postOnDiscord });
  }

  async editNoticeboardItem(noticeboardItem: NoticeboardItemDto): Promise<void> {
    return this.transport.authPut<void>(`${noticeboardItem.id || -1}`, noticeboardItem);
  }

  async deleteNoticeboardItem(id: number): Promise<void> {
    return this.transport.authDelete<void>(`${id}`);
  }
}
