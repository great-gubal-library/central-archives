import { BaseLinkResultDto } from '@app/shared/dto/common/base-link-result.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
import { wikify } from './wikilinks';

export function getPageLink(type: PageType, result: BaseLinkResultDto): string {
	switch (type) {
	case PageType.PROFILE:
		return `/${result.server!}/${wikify(result.name!)}`;
	case PageType.FREE_COMPANY:
		return `/fc/${result.server!}/${wikify(result.name!)}`;
	case PageType.COMMUNITY:
		return `/community/${wikify(result.name!)}`;
	case PageType.VENUE:
		return `/venue/${result.server!}/${wikify(result.name!)}`;
	case PageType.EVENT:
		return `/event/${result.id!}`;
	case PageType.STORY:
		return `/story/${result.id!}`;
	case PageType.NOTICEBOARD_ITEM:
		return `/noticeboard-item/${result.id!}`;
	case PageType.IMAGE:
		return `/image/${result.id!}`;
	}
}
