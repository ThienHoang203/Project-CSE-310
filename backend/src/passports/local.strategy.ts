import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Strategy } from 'passport-local';
import { User } from 'src/entities/user.entity';
import { AuthService } from 'src/modules/auth/auth.service';
import LoginDto from 'src/modules/auth/dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      //these attribute is option, these are used to help know which field is used for login, default these are username and password
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<User> {
    //validate input from user
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
    //validate user in database
    const user = await this.authService.validateUser(loginDto);
    return user;
  }
}
