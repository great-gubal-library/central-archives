import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Region, SiteRegion } from '@app/shared/enums/region.enum';
import { Request } from 'express';
import { getRegionByHostname } from '@app/shared/http';

export const ClientRegion = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SiteRegion => {
    const request = ctx.switchToHttp().getRequest() as Request;
    return getRegionByHostname(request.hostname);
  },
);
