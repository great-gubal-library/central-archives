import { Injectable, Logger } from "@nestjs/common";
import { BotGateway } from "./bot.gateway";

@Injectable()
export class AnnouncementService {
	private readonly logger = new Logger(AnnouncementService.name);

	private readonly timers = new Map<number, number[]>();

	constructor(private readonly botGateway: BotGateway) {
		this.load();
	}

	async refresh(eventId: number): Promise<void> {
		const eventTimers = this.timers.get(eventId);

		if (eventTimers) {
			// Prevent existing timers for this event from firing, as we're about to reload its data
			eventTimers.forEach(timer => clearTimeout(timer));
			this.timers.delete(eventId);
		}

		await this.load(eventId);
	}

	async load(eventId?: number): Promise<void> {
		this.logger.log(`Refreshing event timers for ${eventId ? `event ${eventId}` : 'all events'}`);
	}
}
