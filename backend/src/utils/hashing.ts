import * as bcrypt from 'bcrypt';

export async function compareHashedString(plainText: string, hashedText: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashedText);
}

export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(+(process.env.HASHING_PASSWORD_SALT || 10));
  return bcrypt.hash(plainPassword, salt);
}

export async function hashToken(plainToken: string): Promise<string> {
  const salt = await bcrypt.genSalt(+(process.env.HASHING_TOKEN_SALT || 10));
  return bcrypt.hash(plainToken, salt);
}
