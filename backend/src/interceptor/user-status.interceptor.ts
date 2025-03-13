import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { from, Observable, switchMap } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/decorator/public-route.decorator';
import { UserStatus } from 'src/entities/user.entity';
import { NewTokenPayloadType, TokenPayloadType } from 'src/modules/auth/auth.service';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class UserStatusInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return next.handle();

    const request: Request = context.switchToHttp().getRequest();

    const payload = request?.user as TokenPayloadType | NewTokenPayloadType;
    const userId = payload.userId;
    if (!userId) return next.handle();

    return from(this.userService.findById(userId)).pipe(
      switchMap(({ status }) => {
        if (status === UserStatus.DISABLE) throw new ForbiddenException('user đã disable!');

        return next.handle();
      }),
    );
  }
}
