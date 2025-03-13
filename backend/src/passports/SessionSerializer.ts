import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: User, done: (err, user: User) => void) {
    console.log('Serialize::');

    done(null, user);
  }

  async deserializeUser(user: User, done: (err, user: User | null) => void) {
    console.log('Deserialize::');
    const userDB = await this.userService.findById(user.id);
    return userDB ? done(null, userDB) : done(null, null);
  }
}
