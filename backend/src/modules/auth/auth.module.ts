import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/passports/local.strategy';
import { ConfigService } from '@nestjs/config';
import { RefeshToken } from 'src/entities/refesh-token.entity';
import { SessionSerializer } from 'src/passports/SessionSerializer';
import ResetPassword from 'src/entities/reset-password.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, SessionSerializer],
  imports: [
    UserModule,
    PassportModule,
    TypeOrmModule.forFeature([RefeshToken, ResetPassword]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRE_TIME') },
      }),
      global: true,
    }),
  ],
  exports: [AuthService, TypeOrmModule],
})
export class AuthModule {}
