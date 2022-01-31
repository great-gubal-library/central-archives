import { UserInfo } from '@app/auth/model/user-info';
import { Character, Image, Server, Venue } from '@app/entity';
import { VenueTag } from '@app/entity/venue-tag.entity';
import { IdWrapper } from '@app/shared/dto/common/id-wrapper.dto';
import { VenueSummaryDto } from '@app/shared/dto/venues/venue-summary.dto';
import { VenueDto } from '@app/shared/dto/venues/venue.dto';
import { VenueLocation } from '@app/shared/enums/venue-location.enum';
import html from '@app/shared/html';
import SharedConstants from '@app/shared/SharedConstants';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import crypto from 'crypto';
import { DateTime } from 'luxon';
import { Connection, EntityManager, Repository } from 'typeorm';
import { checkCarrdProfile } from '../common/api-checks';
import { ImagesService } from '../images/images.service';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue) private venueRepo: Repository<Venue>,
    private connection: Connection,
    private imagesService: ImagesService,
  ) {}

	async getVenues(filter: { characterId?: number, limit?: number }): Promise<VenueSummaryDto[]> {
		const myVenues = await this.venueRepo.find({
			where: filter.characterId ? { owner: { id: filter.characterId } } : undefined,
			order: { 'createdAt': 'DESC' },
			relations: [ 'owner', 'server' ],
			take: filter.limit || undefined,
		});

		return myVenues.map(venue => this.toVenueSummaryDto(venue));
	}

	private toVenueSummaryDto(venue: Venue): VenueSummaryDto {
		let address: string;

		if (venue.location === VenueLocation.OPEN_WORLD) {
			address = venue.address;
		} else {
			const plotTerm = venue.location === VenueLocation.HOUSE ? 'plot' : 'apartment';
			address = `Ward ${venue.ward}, ${plotTerm} ${venue.plot}`;

			if (venue.subdivision) {
				address += ' (subdivision)';
			}
		}

		return {
			id: venue.id,
			name: venue.name,
			server: venue.server.name,
			housingArea: venue.housingArea,
			address
		}
	}

	async getVenueByName(name: string, server: string, user?: UserInfo): Promise<VenueDto> {
		const venue = await this.venueRepo.findOne({
			where: {
				name,
				server: {
					name: server,
				},
			},
			relations: [ 'server', 'owner', 'owner.server', 'banner', 'banner.owner', 'tags' ]
		});

		if (!venue) {
			throw new NotFoundException('Venue not found');
		}

		return this.toVenueDto(venue, user);
	}

	async getVenue(venueId: number, user?: UserInfo): Promise<VenueDto> {
		const venue = await this.venueRepo.findOne({
			where: {
				id: venueId,
			},
			relations: [ 'server', 'owner', 'owner.server', 'banner', 'banner.owner', 'tags' ]
		});

		if (!venue) {
			throw new NotFoundException('Venue not found');
		}

		return this.toVenueDto(venue, user);
	}

	private async toVenueDto(venue: Venue, user?: UserInfo): Promise<VenueDto> {
		const banner = await venue.banner;

		return {
			id: venue.id,
			mine: !!venue.owner && !!user && user.characters.some(ch => ch.id === venue.owner!.id),
			foundedAt: venue.foundedAt,
			name: venue.name,
			server: venue.server.name,
			owner: venue.owner.name,
			ownerServer: venue.owner.server.name,
			description: venue.description,
			purpose: venue.purpose,
			website: venue.website,
			status: venue.status,
			location: venue.location,
			address: venue.address,
			housingArea: venue.housingArea,
			ward: venue.ward,
			plot: venue.plot,
			subdivision: venue.subdivision,
			carrdProfile: venue.carrdProfile,
			tags: venue.tags.map(tag => tag.name),
			banner: !banner ? null : {
				id: banner.id,
				url: this.imagesService.getUrl(banner),
				width: banner.width,
				height: banner.height,
			}
		}
	}

	async createVenue(venueDto: VenueDto, user: UserInfo): Promise<IdWrapper> {
		return this.connection.transaction(async em => {
			const character = await em.getRepository(Character).findOne({
				where: {
					name: venueDto.owner,
					server: {
						name: venueDto.ownerServer,
					},
					user: {
						id: user.id
					},
				},
				relations: [ 'server', 'user' ]
			});

			if (!character) {
				throw new BadRequestException('Invalid owner character');
			}

			const venue = new Venue();
			venue.owner = character;
			venue.tags = [];
			await this.saveInternal(em, venue, venueDto, user);
			return { id: venue.id };
		});		
	}

	async editVenue(venueDto: VenueDto, user: UserInfo): Promise<void> {
		await this.connection.transaction(async em => {
			const venue = await em.getRepository(Venue).findOne({
				where: {
					id: venueDto.id,
					owner: {
						user: {
							id: user.id
						}
					},
				},
				relations: [ 'banner', 'banner.owner', 'owner', 'tags' ]
			});

			if (!venue) {
				throw new NotFoundException('Venue not found');
			}

			await this.saveInternal(em, venue, venueDto, user);
		});		
	}

	/* eslint-disable no-param-reassign */
	private async saveInternal(em: EntityManager, venue: Venue, venueDto: VenueDto, user: UserInfo): Promise<void> {
		venue.name = venueDto.name;
		venue.description = html.sanitize(venueDto.description);
		venue.website = venueDto.website; // TODO: Validate
		venue.purpose = venueDto.purpose;
		venue.status = venueDto.status;
		venue.carrdProfile = checkCarrdProfile(venueDto.carrdProfile, user);

		// Validate founding date

		if (venueDto.foundedAt) {
			const foundedAt = DateTime.fromISO(venueDto.foundedAt, {
				zone: SharedConstants.FFXIV_SERVER_TIMEZONE
			});

			if (!foundedAt.isValid || foundedAt.toMillis() > Date.now()) {
				throw new BadRequestException('Invalid founding date');
			}

			venue.foundedAt = foundedAt.toISODate();
		} else {
			venue.foundedAt = null;
		}

		// Validate server

		const server = await em.getRepository(Server).findOne({
			where: {
				name: venueDto.server
			}
		});

		if (!server) {
			throw new BadRequestException('Invalid server');
		}

		venue.server = server;

		// Set location

		venue.location = venueDto.location;

		if (venueDto.location === VenueLocation.OPEN_WORLD) {
			venue.address = venueDto.address;
			venue.housingArea = null;
			venue.ward = null;
			venue.plot = null;
			venue.subdivision = null;
		} else {
			venue.address = '';
			venue.housingArea = venueDto.housingArea;
			venue.ward = venueDto.ward;
			venue.plot = venueDto.plot;

			if (venueDto.location === VenueLocation.HOUSE) {
				const plot = venueDto.plot!;

				if (plot > SharedConstants.housing.MAX_SUBDIVISION_PLOT) {
					throw new BadRequestException('Invalid plot number');
				}

				venue.plot = plot;
				venue.subdivision = plot >= SharedConstants.housing.MIN_SUBDIVISION_PLOT;
			} else {
				const room = venueDto.plot!;

				if (room > SharedConstants.housing.MAX_APARTMENT_NUMBER) {
					throw new BadRequestException('Invalid room number');
				}

				venue.plot = room;
				venue.subdivision = venueDto.subdivision;
			}
		}

		// Set banner

		if (venueDto.banner && venueDto.banner.id) {
			const banner = await em.getRepository(Image).findOne({
				where: {
					id: venueDto.banner.id,
					owner: venue.owner
				}
			});

			if (!banner) {
				throw new BadRequestException('Banner not found');
			}

			if (banner.width / banner.height < SharedConstants.MIN_BANNER_ASPECT_RATIO) {
				throw new BadRequestException('Banner is too tall for its width');
			}

			venue.banner = Promise.resolve(banner);
		} else {
			venue.banner = Promise.resolve(null);
		}
		
		// Set tags

		const existingTagNames = venue.tags.map((tag) => tag.name);
		const newTagNames = venueDto.tags.filter((tagName) => tagName !== '' && !existingTagNames.includes(tagName));
		const tagsToDelete = venue.tags.filter(tag => !venueDto.tags.includes(tag.name));
		const tagsToRetain = venue.tags.filter(tag => venueDto.tags.includes(tag.name));

		venue.tags = [
			...tagsToRetain,
			...newTagNames.map(
				(tag) =>
					new VenueTag({
						name: tag,
						venue,
					}),
			),
		];

		if (tagsToDelete.length > 0) {
			await Promise.all(tagsToDelete.map(tag => em.remove(tag)));
		}

		await em.save(venue);
	}

  async deleteVenue(venueId: number, user: UserInfo): Promise<void> {
		await this.connection.transaction(async em => {
			const venueRepo = em.getRepository(Venue);
			const venue = await venueRepo.findOne({
				where: {
					id: venueId,
					owner: {
						user: {
							id: user.id
						}
					},
				},
				relations: [ 'owner', 'owner.user' ]
			});

			if (!venue) {
				throw new NotFoundException('Venue not found');
			}

			// Free the name for new venues, but keep the record with a deleted flag
			venue.name = `${crypto.randomUUID()} ${venue.name}`;
			await venueRepo.save(venue);
			await venueRepo.softRemove(venue);
		});
	}
}
