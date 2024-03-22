import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInfo } from '../model/user-info';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.user;
  },
);
