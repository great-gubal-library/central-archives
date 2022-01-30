import { UserInfo } from '@app/auth/model/user-info';
import { Venue } from '@app/entity';
import { VenueSummaryDto } from '@app/shared/dto/venues/venue-summary.dto';
import { VenueDto } from '@app/shared/dto/venues/venue.dto';
import { VenueLocation } from '@app/shared/enums/venue-location.enum';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import crypto from 'crypto';
import { Connection, Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue) private venueRepo: Repository<Venue>,
    private connection: Connection,
    private imagesService: ImagesService,
  ) {}

	async getVenues(filter: { limit?: number }): Promise<VenueSummaryDto[]> {
		const myVenues = await this.venueRepo.find({
			order: { 'createdAt': 'DESC' },
			relations: [ 'owner' ],
			take: filter.limit || undefined,
		});

		return myVenues.map(venue => this.toVenueSummaryDto(venue));
	}

	async getMyVenues(user: UserInfo): Promise<VenueSummaryDto[]> {
		const myVenues = await this.venueRepo.find({
			where: {
				owner: {
					user: {
						id: user.id
					}
				}
			},
			order: { 'createdAt': 'DESC' },
			relations: [ 'owner' ]
		});

		return myVenues.map(venue => this.toVenueSummaryDto(venue));
	}

	private toVenueSummaryDto(venue: Venue): VenueSummaryDto {
		let address: string;

		if (venue.location === VenueLocation.OPEN_WORLD) {
			address = venue.address;
		} else {
			const plotTerm = venue.location === VenueLocation.HOUSE ? 'plot' : 'apartment';
			address = `Ward ${venue.ward}, ${plotTerm} ${venue.plot}}`;

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

	private async toVenueDto(venue: Venue, user?: UserInfo): Promise<VenueDto> {
		const banner = await venue.banner;

		return {
			id: venue.id,
			mine: !!venue.owner && !!user && user.characters.some(ch => ch.id === venue.owner!.id),
			foundedAt: venue.foundedAt.getTime(),
			name: venue.name,
			server: venue.server.name,
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
					}
				}
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
