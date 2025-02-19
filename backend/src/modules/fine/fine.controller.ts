import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FineService } from './fine.service';
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';
import { Public } from 'src/decorator/public-route.decorator';

@Controller('fine')
export class FineController {
  constructor(private readonly fineService: FineService) {}

  @Post()
  create(@Body() createFineDto: CreateFineDto) {
    return this.fineService.create(createFineDto);
  }

  @Get()
  findAll() {
    return this.fineService.findAll();
  }

  @Public()
  @Get('/limited')
  find(@Query() query) {
    console.log(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fineService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFineDto: UpdateFineDto) {
    return this.fineService.update(+id, updateFineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fineService.remove(+id);
  }
}
