import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Req,
  Query,
} from '@nestjs/common';
import { BorrowingTransactionService } from './borrowing-transaction.service';
import { CreateBorrowingTransactionDto } from './dto/create-borrowing-transaction.dto';
import { UpdateBorrowingTransactionDto } from './dto/update-borrowing-transaction.dto';
import { checkAndGetIntValue } from 'src/utils/checkType';
import { UserRole } from 'src/entities/user.entity';
import { Roles } from 'src/decorator/roles.decorator';
import { ResponseMessage } from 'src/decorator/response-message.decorator';
import { BorrowingTransactionStatus } from 'src/entities/borrowing-transaction.entity';
import { Request } from 'express';
import { NewTokenPayloadType, TokenPayloadType } from '../auth/auth.service';
import PaginationBorrowingTransactionDto from './dto/pagination-borrowing-transaction.dto';

@Controller('borrowing')
export class BorrowingTransactionController {
  constructor(private readonly borrowingTransactionService: BorrowingTransactionService) {}

  // ---------------------ADMIN ROUTES-----------------------------

  //get all transaction
  @Get('view')
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.borrowingTransactionService.findAll();
  }

  //get a transation
  @Get('view/:transactionId')
  @Roles(UserRole.ADMIN)
  findOne(@Param('transactionId') transactionId: string) {
    const parsedIntID = checkAndGetIntValue(
      transactionId,
      `id: ${transactionId} phải là số nguyên!`,
      0,
      `id(${transactionId}) phải lớn hơn hoặc bằng 0!`,
    );

    return this.borrowingTransactionService.findById(parsedIntID);
  }

  // update a transaction
  @Patch('update/:transactionId')
  @ResponseMessage('Cập nhật thành công.')
  @Roles(UserRole.ADMIN)
  update(
    @Param('transactionId') transactionId: string,
    @Body() updateData: UpdateBorrowingTransactionDto,
  ) {
    const parsedIntID = checkAndGetIntValue(
      transactionId,
      `id: ${transactionId} phải là số`,
      0,
      `id(${transactionId}) phải lớn hơn hoặc bằng 0`,
    );

    if (!updateData || Object.keys(updateData).length === 0)
      throw new BadRequestException('Empty Data!');

    const { status, returnedAt } = updateData;

    if (status && !returnedAt && status === BorrowingTransactionStatus.RET)
      throw new BadRequestException("status 'returned' phải có attribute 'returnAt'");

    return this.borrowingTransactionService.update(parsedIntID, updateData);
  }

  //accept a transaction
  @Patch('accepted/:transactionId')
  @ResponseMessage('Chấp nhận giao dịch thành công.')
  @Roles(UserRole.ADMIN)
  acceptOneTransaction(@Param('transactionId') transactionId: string) {
    const parsedIntID = checkAndGetIntValue(
      transactionId,
      `id: ${transactionId} phải là số`,
      0,
      `id(${transactionId}) phải lớn hơn hoặc bằng 0`,
    );

    return this.borrowingTransactionService.acceptOneTransaction(parsedIntID);
  }

  //delete a transaction
  @Delete('/:transactionId')
  @ResponseMessage('Xóa giao dịch thành công.')
  @Roles(UserRole.ADMIN)
  remove(@Param('transactionId') transactionId: string) {
    const parsedIntID = checkAndGetIntValue(
      transactionId,
      `id: ${transactionId} phải là số`,
      0,

      `id(${transactionId}) phải lớn hơn hoặc bằng 0`,
    );

    return this.borrowingTransactionService.remove(parsedIntID);
  }

  //--------------------------NORMAL USER ROUTES----------------------

  //create a transaction
  @Post()
  @ResponseMessage('Tạo giao dịch mượn sách thành công.')
  create(
    @Req() req: Request,
    @Body() createBorrowingTransactionDto: CreateBorrowingTransactionDto,
  ) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');

    return this.borrowingTransactionService.create(payload.userId, createBorrowingTransactionDto);
  }

  // get all my transaction or get a limited number of my transaction
  @Get()
  findAllMyTransaction(@Req() req: Request, @Query() query: PaginationBorrowingTransactionDto) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');

    return this.borrowingTransactionService.paginateTransactionByUserId(payload.userId, query);
  }

  //get one my transaction
  @Get('/:transactionId')
  findOneMyTransaction(@Req() req: Request, @Param('transactionId') transactionId: string) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');

    const parsedIntTransactionID = checkAndGetIntValue(
      transactionId,
      `transactionId: ${transactionId} phải là số nguyên!`,
      0,
      `transactionId(${transactionId}) phải lớn hơn hoặc bằng 0!`,
    );

    return this.borrowingTransactionService.findOneForTheUser(
      payload.userId,
      parsedIntTransactionID,
    );
  }

  //The user can cancel a previouse transaction with allow status is waiting
  @Patch('cancel/:transactionId')
  @ResponseMessage('Hủy giao dịch thành công.')
  cancelMyTransaction(@Req() req: Request, @Param('transactionId') transactionId: string) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');

    const parsedIntTransactionID = checkAndGetIntValue(
      transactionId,
      `transactionId: ${transactionId} phải là số nguyên!`,
      0,
      `transactionId(${transactionId}) phải lớn hơn hoặc bằng 0!`,
    );

    return this.borrowingTransactionService.cancelOneForTheUser(
      payload.userId,
      parsedIntTransactionID,
    );
  }
}
