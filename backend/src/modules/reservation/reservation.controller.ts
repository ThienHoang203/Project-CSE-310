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
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Request } from 'express';
import { NewTokenPayloadType, TokenPayloadType } from '../auth/auth.service';
import { ResponseMessage } from 'src/decorator/response-message.decorator';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/entities/user.entity';
import { checkAndGetIntValue } from 'src/utils/checkType';
import { ReservationStatus } from 'src/entities/reservation.entity';
import { AcceptReservationDto } from './dto/accept-reservation.dto';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @ResponseMessage('Tạo mới reservation thành công. Vui lòng chờ admin xác nhận!')
  create(@Req() req: Request, @Body() data: CreateReservationDto) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');
    return this.reservationService.create(payload.userId, data);
  }

  // find all my reservation
  @Get('my-reservations')
  findAllByUserId(@Req() req: Request) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');
    return this.reservationService.findAllByUserId(payload.userId);
  }

  @Get('my-reservation/:reservationId')
  findOneByUserId(@Req() req: Request, @Param('reservationId') reservationId: string) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');

    const parsedIntId = checkAndGetIntValue(
      reservationId,
      'reservationId phải là số nguyên!',
      0,
      'reservationId không được bé hơn 0!',
    );

    return this.reservationService.findOneByIdAndUserId(parsedIntId, payload.userId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.reservationService.findAll();
  }

  @Get('/:reservationId')
  @Roles(UserRole.ADMIN)
  findOne(@Param('reservationId') reservationId: string) {
    const parsedIntId = checkAndGetIntValue(
      reservationId,
      'reservationId phải là số nguyên!',
      0,
      'reservationId không được bé hơn 0!',
    );

    return this.reservationService.findOneById(parsedIntId);
  }

  @Patch('cancel')
  @ResponseMessage('Hủy đặt trước thành công.')
  async cancel(@Req() req: Request, @Body() body: UpdateReservationDto) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');

    const reservation = await this.reservationService.findOneById(body.id);

    if (reservation.status === ReservationStatus.SUC) throw new ForbiddenException();

    return this.reservationService.update(body.id, payload.userId, ReservationStatus.CANC);
  }

  @Patch('accepted')
  @ResponseMessage('Chấp nhận thành công.')
  @Roles(UserRole.ADMIN)
  accept(@Body() { reservationId, userId }: AcceptReservationDto) {
    return this.reservationService.update(reservationId, userId, ReservationStatus.SUC);
  }

  @Delete(':id')
  remove(@Body() { reservationId, userId }: AcceptReservationDto) {
    return this.reservationService.remove(reservationId, userId);
  }
}
