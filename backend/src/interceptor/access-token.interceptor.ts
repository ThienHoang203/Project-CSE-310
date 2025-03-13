import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AccessTokenInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        if (request.user && request.user.accessToken) {
          const newAccessToken = request.user.accessToken;
          response.setHeader('Authorization', `Bearer ${newAccessToken}`);
        }
      }),
    );
  }
}
