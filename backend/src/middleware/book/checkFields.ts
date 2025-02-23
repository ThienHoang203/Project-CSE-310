import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import CreateBookDto from 'src/modules/book/dto/create-book.dto';

@Injectable()
export class CheckFieldsExistMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // const { body } = req;
    // const loginDto = plainToInstance(CreateBookDto, body);
    // const errors = await validate(loginDto);
    // if (errors.length > 0) {
    //   throw new BadRequestException(
    //     errors.map((err) => {
    //       return {
    //         [err.property]: err.constraints ? Object.values(err.constraints)[0] : 'unknown value',
    //       };
    //     }),
    //   );
    // }
    next();
  }
}
