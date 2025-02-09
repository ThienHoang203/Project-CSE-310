import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Strategy } from 'passport-local';
import LoginDto from 'src/modules/auth/dto/login.dto';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      //these attribute is option, these are used to help know which field is used for login, default these are username and password
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string) {
    const loginDto = plainToInstance(LoginDto, { username, password });
    const errors = await validate(loginDto);
    if (errors.length > 0) {
      throw new UnauthorizedException(
        errors.map((err) => {
          return {
            [err.property]: err.constraints ? Object.values(err.constraints)[0] : 'unknown value',
          };
        }),
      );
    }
    const user = await this.userService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
