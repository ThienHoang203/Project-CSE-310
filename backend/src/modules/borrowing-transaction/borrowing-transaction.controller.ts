import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BorrowingTransactionService } from './borrowing-transaction.service';
import { CreateBorrowingTransactionDto } from './dto/create-borrowing-transaction.dto';
import { UpdateBorrowingTransactionDto } from './dto/update-borrowing-transaction.dto';

@Controller('borrowing-transaction')
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
    return this.borrowingTransactionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBorrowingTransactionDto: UpdateBorrowingTransactionDto) {
    return this.borrowingTransactionService.update(+id, updateBorrowingTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.borrowingTransactionService.remove(+id);
  }
}
