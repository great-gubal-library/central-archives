import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AnnouncementService } from "../bot/announcement.service";
import { WebHookEventDto } from "./dto/webhook-event.dto";

@Controller()
export class WebhookController {
	constructor(private readonly announcementService: AnnouncementService) { }

	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	async refresh(@Body() data: WebHookEventDto): Promise<void> {
		await this.announcementService.refresh(data.eventId);
	}
}
