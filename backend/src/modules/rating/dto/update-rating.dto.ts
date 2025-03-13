import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateRatingDto } from './create-rating.dto';

export class UpdateRatingDto extends PartialType(PickType(CreateRatingDto, ['rating', 'comment'])) {}
