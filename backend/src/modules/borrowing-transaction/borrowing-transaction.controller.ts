import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BorrowingTransactionService } from './borrowing-transaction.service';
import { CreateBorrowingTransactionDto } from './dto/create-borrowing-transaction.dto';
import { UpdateBorrowingTransactionDto } from './dto/update-borrowing-transaction.dto';
import { getIntValue } from 'src/utils/checkType';
import { UserRole } from 'src/entities/user.entity';
import { Roles } from 'src/decorator/roles.decorator';

@Controller('borrowing')
export class BorrowingTransactionController {
  constructor(private readonly borrowingTransactionService: BorrowingTransactionService) {}

  @Post()
  create(@Body() createBorrowingTransactionDto: CreateBorrowingTransactionDto) {
    return this.borrowingTransactionService.create(createBorrowingTransactionDto);
  }

  @Get()
  findAll() {
    return this.borrowingTransactionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const parsedIntID = getIntValue(id);

    if (!parsedIntID || parsedIntID < 0)
      throw new BadRequestException(`id: ${id} không phải là số nguyên dương`);

    return this.borrowingTransactionService.findById(parsedIntID);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateBorrowingTransactionDto: UpdateBorrowingTransactionDto) {
    const parsedIntID = getIntValue(id);

    if (!parsedIntID || parsedIntID < 0)
      throw new BadRequestException(`id: ${id} không phải là số nguyên dương`);

    return this.borrowingTransactionService.update(parsedIntID, updateBorrowingTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const parsedIntID = getIntValue(id);

    if (!parsedIntID || parsedIntID < 0)
      throw new BadRequestException(`id: ${id} không phải là số nguyên dương`);

    return this.borrowingTransactionService.remove(parsedIntID);
  }
}
