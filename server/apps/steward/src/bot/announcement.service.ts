import { serverConfiguration } from '@app/configuration';
import { EventAnnouncement, EventLocation, NoticeboardItem } from '@app/entity';
import { noticeboardLocations } from '@app/shared/enums/noticeboard-location.enum';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import escape from 'escape-html';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import schedule, { Job } from 'node-schedule';
import sanitizeHtml from 'sanitize-html';
import { Repository } from 'typeorm';
import { BotGateway } from './bot.gateway';

interface EventDatacenterResult {
	eventId: number;
	datacenter: string;
}

@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name);

  private readonly timers = new Map<number, Job[]>();

  constructor(
    private readonly botGateway: BotGateway,
    @InjectRepository(EventAnnouncement) private eventAnnouncementRepo: Repository<EventAnnouncement>,
		@InjectRepository(EventLocation) private eventLocationRepo: Repository<EventLocation>,
		@InjectRepository(NoticeboardItem) private noticeboardItemRepo: Repository<NoticeboardItem>,
  ) {
    void this.load();
  }

	async postNoticeboardItem(noticeboardItemId: number): Promise<void> {
		const noticeboardItem = await this.noticeboardItemRepo.findOne(noticeboardItemId, {
			relations: [ 'owner' ],
		});

		if (!noticeboardItem) {
			throw new NotFoundException(`Noticeboard item with id ${noticeboardItemId} not found.`);
		}

		const subtitle = `${noticeboardLocations[noticeboardItem.location]} — by ${noticeboardItem.owner.name}`
		const link = `${serverConfiguration.frontendRoot}/noticeboard/${noticeboardItem.id}`;
		const content = `<strong>${escape(noticeboardItem.title)}</strong><br><em>${escape(subtitle)}</em><br><br>${noticeboardItem.content}`;
		const contentHtml = sanitizeHtml(content, {
			allowedTags: [ 'b', 'i', 'strong', 'em', 'code', 'tt', 'blockquote', 'p', 'br' ]
		});
		let contentMarkdown = NodeHtmlMarkdown.translate(contentHtml);

		if (!contentMarkdown.endsWith('\n')) {
			contentMarkdown += '\n';
		}

		contentMarkdown += `\n${link}`;

		try {
			await this.botGateway.sendNoticeboardItem(contentMarkdown);
		} catch (e) {
			if (e instanceof Error) {
				this.logger.error(e.message, e.stack);
			} else {
				this.logger.error(e);
			}
		}
	}

  async refresh(eventId: number): Promise<void> {
    const eventTimers = this.timers.get(eventId);

    if (eventTimers) {
      // Prevent existing timers for this event from firing, as we're about to reload its data
      eventTimers.forEach((timer) => timer.cancel());
      this.timers.delete(eventId);
    }

    await this.load(eventId);
  }

  async load(eventId?: number): Promise<void> {
    this.logger.log(`Refreshing event timers for ${eventId ? `event ${eventId}` : 'all events'}`);

		// Query announcements
		const query = this.eventAnnouncementRepo.createQueryBuilder('ea')
			.innerJoinAndSelect('ea.event', 'event')
			.select([ 'ea.id', 'ea.content', 'ea.postAt', 'event.id' ])
			.where('ea.postAt >= :now', { now: new Date() });

		if (eventId) {
			query.andWhere('event.id = :eventId', { eventId });
		}

		const announcements = await query.getMany();

		if (announcements.length === 0) {
			return;
		}

		// Query event location datacenters
		const eventIds = Array.from(new Set(announcements.map(announcement => announcement.event.id))); // remove duplicates
		const datacentersByEventId = await this.getEventDatacenters(eventIds);

		// Schedule announcements
		const now = Date.now();

		for (const announcement of announcements) {
			const remainingMS = announcement.postAt.getTime() - now;
			const announcementEventId = announcement.event.id;
			const eventUrl = `${serverConfiguration.frontendRoot}/event/${announcementEventId}`;
			const content = `${announcement.content}\n\n${eventUrl}`;
			
			const eventDatacenters = datacentersByEventId.get(announcementEventId) || new Set<string>();

			// Schedule once announcement per each datacenter used in event locations
			eventDatacenters.forEach(datacenter => {
				const timerId = schedule.scheduleJob(announcement.postAt, async () => {
					this.unregisterTimer(announcementEventId, timerId);
					await this.postAnnouncement(content, datacenter);
				});

				this.registerTimer(announcementEventId, timerId);
			})

			this.logger.log(
				`Event ${announcementEventId} firing in ${remainingMS} msec for datacenters: ${Array.from(eventDatacenters)}`);
		}
  }

	private async getEventDatacenters(eventIds: number[]): Promise<Map<number, Set<string>>> {
		const datacentersByEventId = new Map<number, Set<string>>();
		const eventDatacenterResults = await this.eventLocationRepo.createQueryBuilder('el')
			.innerJoinAndSelect('el.event', 'event')
			.innerJoinAndSelect('el.server', 'server')
			.where('event.id IN (:...eventIds)', { eventIds })
			.select('event.id', 'eventId')
			.addSelect('server.datacenter', 'datacenter')
			.distinct()
			.getRawMany<EventDatacenterResult>();
		
		eventDatacenterResults.forEach(result => {
			let datacenters = datacentersByEventId.get(result.eventId);

			if (!datacenters) {
				datacenters = new Set<string>();
				datacentersByEventId.set(result.eventId, datacenters);
			}

			datacenters.add(result.datacenter);
		});

		return datacentersByEventId;
	}

	private async postAnnouncement(content: string, datacenter: string) {
		try {
			await this.botGateway.sendAnnouncement(content, datacenter);
		} catch (e) {
			if (e instanceof Error) {
				this.logger.error(e.message, e.stack);
			} else {
				this.logger.error(e);
			}
		}
	}

	private registerTimer(eventId: number, timerId: Job) {
		let timers = this.timers.get(eventId);

		if (!timers) {
			timers = [];
			this.timers.set(eventId, timers);
		}

		timers.push(timerId);
	}

	private unregisterTimer(eventId: number, timerId: Job) {
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
