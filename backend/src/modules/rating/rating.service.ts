import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Repository } from 'typeorm';
import { Rating } from 'src/entities/rating.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Book } from 'src/entities/book.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(
    userId: number,
    createRatingDto: CreateRatingDto,
  ): Promise<{ id: number; userId: number; bookId: number }> {
    const ratingObj = this.ratingRepository.create(createRatingDto);
    ratingObj.userId = userId;
    const { bookId } = ratingObj;

    let hasId: boolean = await this.userRepository.existsBy({ id: userId });
    if (!hasId) throw new BadRequestException(`user(id: ${userId}) không tồn tại!`);

    hasId = await this.bookRepository.existsBy({ id: bookId });
    if (!hasId) throw new BadRequestException(`book(id: ${bookId}) không tồn tại!`);

    const result = await this.ratingRepository.insert(ratingObj);

    return {
      id: result.identifiers[0]?.id,
      bookId: bookId,
      userId: userId,
    };
  }

  async findById(ratingId: number): Promise<Rating> {
    const rating = await this.ratingRepository.findOneBy({ id: ratingId });
    if (!rating) throw new BadRequestException(`Không thể tìm thấy rating với ID:${ratingId}`);
    return rating;
  }

  async findAllByBookID(bookId: number): Promise<{ totalRatings: number; ratings: Rating[] }> {
    const [ratings, count] = await this.ratingRepository.findAndCountBy({ bookId });

    return { totalRatings: count, ratings };
  }

  async findAllByUserId(userId: number): Promise<{ totalRatings: number; ratings: Rating[] }> {
    const [ratings, count] = await this.ratingRepository.findAndCountBy({ userId });

    return { totalRatings: count, ratings };
  }

  async update(id: number, updateRatingDto: UpdateRatingDto): Promise<{ ratingId: number }> {
    const result = await this.ratingRepository.update({ id }, updateRatingDto);

    if (result.affected === 0) throw new InternalServerErrorException('Server bị lỗi!');

    return { ratingId: id };
  }

  async remove(id: number): Promise<{ ratingId: number }> {
    const result = await this.ratingRepository.delete({ id });

    if (!result?.affected || result.affected === 0)
      throw new InternalServerErrorException('Server bị lỗi!');

    return { ratingId: id };
  }
}
