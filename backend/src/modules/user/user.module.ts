import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { JwtStrategy } from 'src/passports/jwt.strategy';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [UserService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class UserModule {}
