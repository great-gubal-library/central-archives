import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AnnouncementService } from "../bot/announcement.service";
import { WebHookEventDto } from "./dto/webhook-event.dto";
import { WebHookNoticeboardDto } from "./dto/webhook-noticeboard.dto";

@Controller()
export class WebhookController {
	constructor(private readonly announcementService: AnnouncementService) { }

  @Get()
  healthCheck() {
    return 'Cope. Seethe. Mald.';
  }

	@Post('event')
	@HttpCode(HttpStatus.NO_CONTENT)
	async refresh(@Body() data: WebHookEventDto): Promise<void> {
		await this.announcementService.refresh(data.eventId);
	}

	@Post('noticeboard')
	@HttpCode(HttpStatus.NO_CONTENT)
	async postNoticeboardItem(@Body() data: WebHookNoticeboardDto): Promise<void> {
		await this.announcementService.postNoticeboardItem(data.noticeboardItemId);
	}
}
