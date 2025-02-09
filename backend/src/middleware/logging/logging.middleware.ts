import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    let isAuth = false;
    if (!isAuth) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Unauthorized',
      });
    }
    req.user = 'user: thien';

    next();
  }
}
