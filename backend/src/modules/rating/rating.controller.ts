import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Public } from 'src/decorator/public-route.decorator';
import { checkAndGetIntValue } from 'src/utils/checkType';
import { ResponseMessage } from 'src/decorator/response-message.decorator';
import { Request } from 'express';
import { NewTokenPayloadType, TokenPayloadType } from '../auth/auth.service';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  //------------------------------ADMIN ROUTE------------------------------

  //-------------------------------NORMAL USER ROLE-------------------------

  //get all comments about the book
  @Get(':bookId')
  @Public()
  findAllByBookId(@Param('bookId') bookId: string) {
    const parsedIntId = checkAndGetIntValue(
      bookId,
      'bookId phải là số nguyên!',
      0,
      'bookId không được nhỏ hơn 0',
    );

    return this.ratingService.findAllByBookID(parsedIntId);
  }

  @Post()
  @ResponseMessage('Tạo thành công')
  create(@Req() req: Request, @Body() createRatingDto: CreateRatingDto) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');

    return this.ratingService.create(payload.userId, createRatingDto);
  }

  @Patch(':ratingId')
  @ResponseMessage('Cập nhật thành công')
  async update(
    @Req() req: Request,
    @Param('ratingId') ratingId: string,
    @Body() body: UpdateRatingDto,
  ) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');

    const parseIntId = checkAndGetIntValue(
      ratingId,
      'ratingId phải là số nguyên!',
      0,
      'ratingId không được nhỏ hơn 0',
    );

    const rating = await this.ratingService.findById(parseIntId);

    if (payload.userId !== rating.userId)
      throw new ForbiddenException(`ratingId:${ratingId} không thuộc về userId:${rating.userId}`);

    return this.ratingService.update(parseIntId, body);
  }

  @Delete(':ratingId')
  @ResponseMessage('Xóa thành công')
  async remove(@Req() req: Request, @Param('ratingId') ratingId: string) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');

    const parseIntId = checkAndGetIntValue(
      ratingId,
      'ratingId phải là số nguyên!',
      0,
      'ratingId không được nhỏ hơn 0',
    );

    const rating = await this.ratingService.findById(parseIntId);

    if (payload.userId !== rating.userId)
      throw new ForbiddenException(`ratingId:${ratingId} không thuộc về userId:${rating.userId}`);

    return this.ratingService.remove(parseIntId);
  }
}
