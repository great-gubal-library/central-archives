import { EventAnnouncement } from '@app/entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotGateway } from './bot.gateway';

@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name);

  private readonly timers = new Map<number, NodeJS.Timeout[]>();

  constructor(
    private readonly botGateway: BotGateway,
    @InjectRepository(EventAnnouncement) private eventAnnouncementRepo: Repository<EventAnnouncement>,
  ) {
    this.load();
  }

  async refresh(eventId: number): Promise<void> {
    const eventTimers = this.timers.get(eventId);

    if (eventTimers) {
      // Prevent existing timers for this event from firing, as we're about to reload its data
      eventTimers.forEach((timer) => clearTimeout(timer));
      this.timers.delete(eventId);
    }

    await this.load(eventId);
  }

  async load(eventId?: number): Promise<void> {
    this.logger.log(`Refreshing event timers for ${eventId ? `event ${eventId}` : 'all events'}`);

		const query = this.eventAnnouncementRepo.createQueryBuilder('ea')
			.innerJoinAndSelect('ea.event', 'event')
			.select([ 'ea.id', 'ea.content', 'ea.postAt', 'event.id' ])
			.where('ea.postAt >= :now', { now: new Date() });

		if (eventId) {
			query.andWhere('event.id = :eventId', { eventId });
		}

		const announcements = await query.getMany();
		const now = Date.now();

		for (const announcement of announcements) {
			const remainingMS = announcement.postAt.getTime() - now;
			const announcementEventId = announcement.event.id;
			const content = announcement.content;
			
			const timerId = setTimeout(async () => {
				this.unregisterTimer(announcementEventId, timerId);
				await this.postAnnouncement(content);
			}, remainingMS);

			this.registerTimer(announcementEventId, timerId);
			this.logger.log(`Event ${announcementEventId} firing in ${remainingMS} msec`);
		}
  }

	private async postAnnouncement(content: string) {
		try {
			await this.botGateway.sendAnnouncement(content);
		} catch (e) {
			if (e instanceof Error) {
				this.logger.error(e.message, e.stack);
			} else {
				this.logger.error(e);
			}
		}
	}

	private registerTimer(eventId: number, timerId: NodeJS.Timeout) {
		let timers = this.timers.get(eventId);

		if (!timers) {
			timers = [];
			this.timers.set(eventId, timers);
		}

		timers.push(timerId);
	}

	private unregisterTimer(eventId: number, timerId: NodeJS.Timeout) {
		const timers = this.timers.get(eventId);

		if (!timers) {
			return;
		}

		const timerIndex = timers.indexOf(timerId);

		if (timerIndex !== -1) {
			timers.splice(timerIndex, 1);
		}
	}
}
