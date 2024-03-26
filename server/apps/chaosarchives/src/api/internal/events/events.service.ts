import { UserInfo } from '@app/authorization/model/user-info';
import { serverConfiguration } from '@app/configuration';
import { Character, Event, EventAnnouncement, EventLocation, Image, Server } from '@app/entity';
import SharedConstants from '@app/shared/shared-constants';
import { BannerDto } from '@app/shared/dto/characters/banner.dto';
import { BaseEventDto } from '@app/shared/dto/events/base-event.dto';
import { EventAnnouncementDto } from '@app/shared/dto/events/event-announcement.dto';
import { EventCreaterResultDto } from '@app/shared/dto/events/event-create-result.dto';
import { EventEditDto } from '@app/shared/dto/events/event-edit.dto';
import { EventLocationDto } from '@app/shared/dto/events/event-location.dto';
import { EventSearchResultDto } from '@app/shared/dto/events/event-search-result.dto';
import { EventSummariesDto } from '@app/shared/dto/events/event-summaries.dto';
import { EventSummaryDto } from '@app/shared/dto/events/event-summary.dto';
import { EventDto } from '@app/shared/dto/events/event.dto';
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { EventSource } from '@app/shared/enums/event-source.enum';
import html from '@app/shared/html';
import { isValidUrl } from '@app/shared/validation/validators';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { DateTime, Duration } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { DataSource, EntityManager, FindOptionsWhere, In, IsNull, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Contains } from '../../../common/db';
import utils from '../../../common/utils';
import { ImagesService } from '../images/images.service';
import { ChocoboChronicleService } from './chocobo-chronicle.service';
import { ExternalEvent } from './model/external-event';
import { SiteRegion, asRegionOrThrow, asSiteRegion } from '@app/shared/enums/region.enum';
import { regionLock } from 'apps/chaosarchives/src/common/api-checks';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  private readonly CACHE_DURATION_SHORT_MS = Duration.fromObject({ minutes: 5 }).toMillis();

  private readonly MAX_RESULTS = 10;

  constructor(
    private readonly ccService: ChocoboChronicleService,
    private readonly imagesService: ImagesService,
    private readonly connection: DataSource,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRedis()
    private readonly redisService: Redis,
    private readonly httpService: HttpService,
  ) {}

  async getEvent(id: number, edit: boolean, user?: UserInfo): Promise<BaseEventDto> {
    // TODO: optimize query
    const event = await this.eventRepo.findOne({
      where: {
        id,
      },
      relations: ['owner', 'owner.user', 'locations', 'locations.server', 'banner', 'banner.owner'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.toEventDto(event, edit, user);
  }

  async createEvent(eventDto: EventEditDto, characterId: number, user: UserInfo): Promise<EventCreaterResultDto> {
    const eventEntity = await this.connection.transaction(async (em) => {
      const character = await em.getRepository(Character).findOne({
        where: {
          id: characterId,
          user: {
            id: user.id,
          },
          verifiedAt: Not(IsNull()),
        },
        relations: ['user', 'server'],
      });

      if (!character) {
        throw new BadRequestException('Invalid character ID');
      }

      regionLock(character.server.region);

      const event = new Event();
      event.region = character.server.region;
      event.locations = [];
      event.announcements = Promise.resolve([]);
      event.owner = character;
      event.source = EventSource.WEBSITE;
      await this.updateEventInternal(em, event, eventDto);
      return event;
    });

    void this.notifySteward(eventEntity); // no await

    const result = (await this.toEventDto(eventEntity, true, user)) as EventCreaterResultDto;
    result.id = eventEntity.id;
    return result;
  }

  async updateEvent(eventId: number, eventDto: EventEditDto, user: UserInfo): Promise<EventEditDto> {
    const eventEntity = await this.connection.transaction(async (em) => {
      const event = await em.getRepository(Event).findOne({
        where: {
          id: eventId,
          owner: {
            user: {
              id: user.id,
            },
          },
        },
        relations: ['owner', 'owner.user', 'locations', 'locations.server', 'banner', 'banner.owner'],
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      await this.updateEventInternal(em, event, eventDto);
      return event;
    });

    void this.notifySteward(eventEntity); // no await
    return this.toEventDto(eventEntity, true, user) as Promise<EventEditDto>;
  }

  private async updateEventInternal(em: EntityManager, eventEntity: Event, eventDto: EventEditDto): Promise<void> {
    const event = eventEntity;
    event.title = eventDto.title;
    event.startDateTime = new Date(eventDto.startDateTime);
    event.endDateTime = eventDto.endDateTime ? new Date(eventDto.endDateTime) : null;
    event.details = html.sanitize(eventDto.details);
    event.oocDetails = html.sanitize(eventDto.oocDetails);
    event.link = eventDto.link; // TODO: Validate
    event.contact = eventDto.contact;
    event.recurring = eventDto.recurring;

    if (eventDto.banner && eventDto.banner.id) {
      const banner = await em.getRepository(Image).findOne({
        where: {
          id: eventDto.banner.id,
          owner: {
            id: event.owner.id,
          },
        },
        relations: ['owner'],
      });

      if (!banner) {
        throw new BadRequestException('Banner not found');
      }

      if (banner.width / banner.height < SharedConstants.MIN_BANNER_ASPECT_RATIO) {
        throw new BadRequestException('Banner is too tall for its width');
      }

      event.banner = Promise.resolve(banner);
    } else {
      event.banner = Promise.resolve(null as unknown as Image);
    }

    if (eventDto.locations.length === 0) {
      throw new BadRequestException('Event must have at least one location');
    }

    /// Update locations; O(n^2) filters used for code clarity, since number of notifications is small
    const dtoLocationIds = eventDto.locations.map((location) => location.id).filter((id) => !!id);
    const locations: EventLocation[] = [];
    const reusedLocations: EventLocation[] = [];
    const locationsToRemove: EventLocation[] = [];

    for (const location of event.locations) {
      if (!dtoLocationIds.includes(location.id)) {
        reusedLocations.push(location);
      } else {
        locationsToRemove.push(location);
      }
    }

    if (locationsToRemove.length > 0) {
      await Promise.all(locationsToRemove.map((location) => em.remove(location)));
    }

    const locationServers = await em.getRepository(Server).find({
      where: {
        name: In(eventDto.locations.map((location) => location.server)),
      },
    });

    for (const dtoLocation of eventDto.locations) {
      let location = reusedLocations.find((l) => l.id === dtoLocation.id);

      if (!location) {
        location = new EventLocation();
        location.event = event;
      }

      locations.push(location);
      location.name = dtoLocation.name;
      location.address = dtoLocation.address;
      location.tags = dtoLocation.tags;
      location.link = dtoLocation.link;

      if (location.link && !isValidUrl(location.link)) {
        throw new BadRequestException(`Invalid location link: ${location.link}`);
      }

      const server = locationServers.find((s) => s.name === dtoLocation.server);

      if (!server) {
        throw new BadRequestException(`Server ${dtoLocation.server} not found`);
      }

      location.server = server;
    }

    event.locations = locations;
    event.region = locations[0].server.region;

    // Update announcements; O(n^2) filters used for code clarity, since number of notifications is small
    const dtoAnnouncementIds = eventDto.announcements.map((notification) => notification.id).filter((id) => !!id);
    const announcements: EventAnnouncement[] = [];
    const reusedAnnouncements: EventAnnouncement[] = [];
    const announcementsToRemove: EventAnnouncement[] = [];

    for (const announcement of await event.announcements) {
      if (dtoAnnouncementIds.includes(announcement.id)) {
        reusedAnnouncements.push(announcement);
      } else {
        announcementsToRemove.push(announcement);
      }
    }

    if (announcementsToRemove.length > 0) {
      await Promise.all(announcementsToRemove.map((announcement) => em.remove(announcement)));
    }

    for (const dtoAnnouncement of eventDto.announcements) {
      let announcement = reusedAnnouncements.find((n) => n.id === dtoAnnouncement.id);

      if (!announcement) {
        announcement = new EventAnnouncement();
        announcement.event = event;
      }

      announcements.push(announcement);
      announcement.content = dtoAnnouncement.content;
      announcement.minutesBefore = dtoAnnouncement.minutesBefore;
      announcement.postAt = DateTime.fromJSDate(event.startDateTime)
        .minus({ minutes: announcement.minutesBefore })
        .toJSDate();
    }

    event.announcements = Promise.resolve(announcements);
    await em.getRepository(Event).save(event);
  }

  async deleteEvent(eventId: number, user: UserInfo): Promise<void> {
    const eventEntity = await this.connection.transaction(async (em) => {
      const eventRepo = em.getRepository(Event);
      const event = await eventRepo.findOne({
        where: {
          id: eventId,
          owner: {
            user: {
              id: user.id,
            },
          },
        },
        relations: ['owner'],
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      await eventRepo.softRemove(event);
      return event;
    });

    void this.notifySteward(eventEntity); // no await
  }

  private async notifySteward(event: Event): Promise<void> {
    try {
      this.logger.debug(`Notifying Steward about event ${event.id} change`);
      await firstValueFrom(
        this.httpService.post(`${serverConfiguration.stewardWebhookUrl}/event`, { eventId: event.id }),
      );
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message, e.stack);
      } else {
        this.logger.error(e);
      }
    }
  }

  async getEvents(region: SiteRegion, refreshExternal = false): Promise<EventSummariesDto> {
    const eventsTimestamp = await this.redisService.get('eventsTimestamp_' + region);
    let eventsUpToDate = false;

    if (eventsTimestamp) {
      const date = DateTime.fromMillis(parseInt(eventsTimestamp, 10));

      if (DateTime.now().diff(date).toMillis() <= this.CACHE_DURATION_SHORT_MS) {
        eventsUpToDate = true;
      }
    }

    if (!refreshExternal || eventsUpToDate) {
      return {
        events: await this.getEventsFromDatabase(region),
        eventsUpToDate,
      };
    }

    // Not cached - fetch and cache
    const [ccEvents] = await Promise.all([this.ccService.fetchEvents()]);

    const events = [...ccEvents].sort((e1, e2) => utils.compareNumbers(e1.startDateTime, e2.startDateTime));
    await this.saveEvents(events);
    await this.redisService.set('eventsTimestamp_' + region, Date.now().toString());
    return {
      events: await this.getEventsFromDatabase(region),
      eventsUpToDate: true,
    };
  }

  private async getEventsFromDatabase(region: SiteRegion): Promise<EventSummaryDto[]> {
    const startOfDay = DateTime.now().setZone(SharedConstants.FFXIV_SERVER_TIMEZONE).startOf('day');

    const conditions: FindOptionsWhere<Event>[] = [
      {
        startDateTime: MoreThanOrEqual(startOfDay.toJSDate()),
        hidden: false,
      },
      {
        endDateTime: MoreThanOrEqual(startOfDay.toJSDate()),
        hidden: false,
      },
    ];

    if (region !== SiteRegion.GLOBAL) {
      conditions.forEach((condition) => (condition.region = asRegionOrThrow(region)));
    }

    const events = await this.eventRepo.find({
      where: conditions,
      order: {
        startDateTime: 'ASC',
        createdAt: 'ASC',
      },
      take: this.MAX_RESULTS,
      relations: ['locations', 'locations.server'],
    });

    return events.map((event) => this.toEventSummaryDto(event));
  }

  private async saveEvents(events: ExternalEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.connection.transaction(async (em) => {
      const links = events.map((event) => event.link);
      const eventRepo = em.getRepository(Event);
      const existingEvents = await eventRepo.find({
        where: {
          externalSourceLink: In(links),
        },
        relations: ['locations'],
      });
      const existingEventsByLink = new Map<string, Event>();

      for (const existingEvent of existingEvents) {
        existingEventsByLink.set(existingEvent.externalSourceLink, existingEvent);
      }

      const savedEvents: Event[] = [];
      const serverNames = new Set(
        events
          .map((event) => event.locations.map((location) => location.server))
          .flat()
          .filter((serverName) => !!serverName),
      );
      const serversByName = new Map<string, Server>();

      if (serverNames.size > 0) {
        const servers = await em.getRepository(Server).find({
          where: {
            name: In(Array.from(serverNames)),
          },
        });

        for (const server of servers) {
          serversByName.set(server.name, server);
        }
      }

      const locationsToRemove: EventLocation[] = [];

      for (const eventDto of events) {
        const event =
          existingEventsByLink.get(eventDto.link) ||
          eventRepo.create({
            locations: [],
          });

        event.title = eventDto.title;
        event.region = eventDto.region;
        event.details = html.sanitize(eventDto.details);
        event.recurring = eventDto.recurring;
        event.startDateTime = new Date(eventDto.startDateTime);
        event.endDateTime = eventDto.endDateTime ? new Date(eventDto.endDateTime) : null;
        event.source = eventDto.source;
        event.externalSourceLink = eventDto.link;

        const dtoLocations = eventDto.locations;

        if (event.locations.length > dtoLocations.length) {
          for (let i = dtoLocations.length; i < event.locations.length; i++) {
            locationsToRemove.push(event.locations[i]);
          }

          event.locations.splice(dtoLocations.length, event.locations.length - dtoLocations.length);
        } else if (event.locations.length < dtoLocations.length) {
          for (let i = event.locations.length; i < dtoLocations.length; i++) {
            const location = new EventLocation();
            location.event = event;
            event.locations.push(location);
          }
        }

        for (let i = 0; i < dtoLocations.length; i++) {
          const location = event.locations[i];
          const locationDto = dtoLocations[i];

          location.name = locationDto.name;
          location.address = locationDto.address;
          location.tags = locationDto.tags;
          location.link = locationDto.link;

          if (location.link && !isValidUrl(location.link)) {
            throw new BadRequestException(`Invalid location link: ${location.link}`);
          }

          const server = serversByName.get(locationDto.server);

          if (!server) {
            throw new BadRequestException(`World server not found: ${server}`);
          }

          location.server = server;
        }

        savedEvents.push(event);
      }

      if (locationsToRemove.length > 0) {
        await Promise.all(locationsToRemove.map((location) => em.remove(location)));
      }

      await eventRepo.save(savedEvents);
    });
  }

  async search(query: string): Promise<EventSearchResultDto[]> {
    const results = await this.eventRepo.find({
      where: {
        title: Contains(query),
      },
      take: 10,
      select: ['id', 'title', 'startDateTime'],
    });

    return results.map((event) => ({
      id: event.id,
      title: event.title,
      startDateTime: event.startDateTime.getTime(),
    }));
  }

  async getByMonth(region: SiteRegion, year: number, month: number): Promise<EventSummaryDto[]> {
    const startOfMonth = DateTime.fromObject(
      {
        year,
        month,
        day: 1,
      },
      {
        zone: SharedConstants.FFXIV_SERVER_TIMEZONE,
      },
    );

    const endOfMonth = startOfMonth.plus({ months: 1 });

    const query = this.eventRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.locations', 'location')
      .leftJoinAndSelect('location.server', 'server')
      .where('event.startDateTime >= :startOfMonth', { startOfMonth: startOfMonth.toJSDate() })
      .andWhere('event.startDateTime < :endOfMonth', { endOfMonth: endOfMonth.toJSDate() })
      .andWhere('event.hidden = :hidden', { hidden: false })
      .orderBy({
        'event.startDateTime': 'ASC',
        'event.createdAt': 'ASC',
      });

    if (region !== SiteRegion.GLOBAL) {
      query.andWhere('event.region = :region', { region });
    }

    const events = await query.getMany();
    return events.map((event) => this.toEventSummaryDto(event));
  }

  private toEventSummaryDto(event: Event): EventSummaryDto {
    return {
      id: event.id,
      title: event.title,
      startDateTime: event.startDateTime.getTime(),
      endDateTime: event.endDateTime ? event.endDateTime.getTime() : null,
      link: event.externalSourceLink || '',
      source: event.source,
      recurring: event.recurring,
      region: event.region,
      locations: event.locations.map((location) => ({
        id: location.id,
        name: location.name,
        address: location.address,
        server: location.server?.name || '',
        tags: location.tags,
        link: location.link,
      })),
    };
  }

  private async toEventDto(event: Event, edit: boolean, user?: UserInfo): Promise<BaseEventDto> {
    const banner = await event.banner;
    let announcements: EventAnnouncement[] = [];
    let images: ImageSummaryDto[] = [];

    if (edit) {
      announcements = await event.announcements;
    } else {
      images = (await this.imagesService.getImages(asSiteRegion(event.region), { eventId: event.id })).data;
    }

    const properties = {
      title: event.title,
      mine: !!event.owner && event.owner.user.id === user?.id,
      details: event.details,
      recurring: event.recurring,
      oocDetails: event.oocDetails,
      startDateTime: event.startDateTime.getTime(),
      endDateTime: event.endDateTime ? event.endDateTime.getTime() : null,
      link: event.externalSourceLink || event.link,
      contact: event.contact,
      banner: !banner
        ? null
        : new BannerDto({
            id: banner.id,
            url: this.imagesService.getUrl(banner),
            width: banner.width,
            height: banner.height,
          }),
      locations: event.locations.map(
        (location) =>
          new EventLocationDto({
            id: location.id,
            name: location.name,
            address: location.address,
            server: location.server.name,
            tags: location.tags,
            link: location.link,
          }),
      ),
    };

    if (!edit) {
      return new EventDto({ ...properties, images });
    }

    return new EventEditDto({
      ...properties,
      announcements: announcements.map(
        (announcement) =>
          new EventAnnouncementDto({
            id: announcement.id,
            minutesBefore: announcement.minutesBefore,
            content: announcement.content,
          }),
      ),
    });
  }
}
