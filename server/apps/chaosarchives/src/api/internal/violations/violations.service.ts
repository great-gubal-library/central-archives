import { UserInfo } from '@app/auth/model/user-info';
import { Character, Community, Event, FreeCompany, Image, NoticeboardItem, Story, User, Venue, Violation } from '@app/entity';
import { ViolationReportDto } from '@app/shared/dto/violations/violation-report.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';
import { isQueryFailedError } from '../../../common/db';

@Injectable()
export class ViolationsService {
	private readonly ENTITIES_BY_PAGE_TYPE = {
		[PageType.PROFILE]: Character,
		[PageType.FREE_COMPANY]: FreeCompany,
		[PageType.COMMUNITY]: Community,
		[PageType.VENUE]: Venue,
		[PageType.EVENT]: Event,
		[PageType.STORY]: Story,
		[PageType.NOTICEBOARD_ITEM]: NoticeboardItem,
		[PageType.IMAGE]: Image,
	};

	constructor(private connection: Connection) {}

	async reportViolation(report: ViolationReportDto, user: UserInfo): Promise<void> {
		try {
			await this.connection.transaction(async em => {
				const userEntity = await em.getRepository(User).findOne({
					where: {
						id: user.id
					},
					select: [ 'id' ]
				});

				if (!userEntity) {
					// Shouldn't happen
					throw new ForbiddenException('User not found');
				}

				await this.checkPageExists(em, report);

				const violationRepo = em.getRepository(Violation);
				const violation = violationRepo.create({
					pageId: report.pageId,
					pageType: report.pageType,
					reason: report.reason,
					open: true,
					reportedBy: user,
				});

				await violationRepo.save(violation);
			});
		} catch (e) {
			if (isQueryFailedError(e) && e.code === 'ER_DUP_ENTRY') {
				throw new ConflictException('You have already reported this page. Please wait until a moderator reviews your report.');
      }

			// default
			throw e;
		}
	}
	
	private async checkPageExists(em: EntityManager, report: ViolationReportDto) {
		const entityType = this.ENTITIES_BY_PAGE_TYPE[report.pageType];
		const entityCount = await em.getRepository(entityType).count({
			where: {
				id: report.pageId
			}
		});

		if (entityCount === 0) {
			throw new BadRequestException('Cannot find the page being reported');
		}
	}
}
