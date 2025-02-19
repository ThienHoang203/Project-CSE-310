import { Injectable } from '@nestjs/common';
import { CreateBorrowingTransactionDto } from './dto/create-borrowing-transaction.dto';
import { UpdateBorrowingTransactionDto } from './dto/update-borrowing-transaction.dto';

@Injectable()
export class BorrowingTransactionService {
  create(createBorrowingTransactionDto: CreateBorrowingTransactionDto) {
    return 'This action adds a new borrowingTransaction';
  }

  findAll() {
    return `This action returns all borrowingTransaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} borrowingTransaction`;
  }

  update(id: number, updateBorrowingTransactionDto: UpdateBorrowingTransactionDto) {
    return `This action updates a #${id} borrowingTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} borrowingTransaction`;
  }
}
