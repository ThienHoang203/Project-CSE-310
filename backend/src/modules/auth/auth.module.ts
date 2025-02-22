import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/passports/local.strategy';
import { JwtStrategy } from 'src/passports/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { RefeshToken } from 'src/entities/refesh-token.entity';
import { RefreshTokenStrategy } from 'src/passports/refresh-token.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  imports: [
    UserModule,
    PassportModule,
    TypeOrmModule.forFeature([RefeshToken]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRE_TIME') },
      }),
      global: true,
    }),
  ],
})
export class AuthModule {}
