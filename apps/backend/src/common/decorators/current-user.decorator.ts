import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { RequestUser } from "../interfaces/request-user.interface";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestUser | undefined => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
