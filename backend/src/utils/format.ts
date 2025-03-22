import { User } from 'src/entities/user.entity';
import { FindOptionsSelect } from 'typeorm';
import 'dayjs/locale/vi';
export function dateFormatter(year: 2 | 4): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: year === 4 ? 'numeric' : '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export const formattedUserRespsonse: FindOptionsSelect<User> = [
  'id',
  'username',
  'name',
  'phoneNumber',
  'email',
  'role',
  'membershipLevel',
  'status',
  'created_at',
  'updated_at',
  'birthDate',
] as FindOptionsSelect<User>;

// export const formattedUserLoginRespsonse: FindOptionsSelect<User> = [
//   'id',
//   'username',
//   'name',
//   'phoneNumber',
//   'email',
//   'role',
//   'status',
//   'password',
//   'membershipLevel',
//   'birthDate',
//   'created_at',
//   'updated_at',
// ] as FindOptionsSelect<User>;
