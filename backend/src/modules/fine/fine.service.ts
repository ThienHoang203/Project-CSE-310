import { Injectable } from '@nestjs/common';
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';

@Injectable()
export class FineService {
  create(createFineDto: CreateFineDto) {
    return 'This action adds a new fine';
  }

  findAll() {
    return `This action returns all fine`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fine`;
  }

  update(id: number, updateFineDto: UpdateFineDto) {
    return `This action updates a #${id} fine`;
  }

  remove(id: number) {
    return `This action removes a #${id} fine`;
  }
}
