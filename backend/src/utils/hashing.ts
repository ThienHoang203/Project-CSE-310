import * as bcrypt from 'bcrypt';

export async function compareHashedString(plainText: string, hashedText: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashedText);
}

export async function hashString(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(+(process.env.HASHING_SALT || 10));
  return bcrypt.hash(plainText, salt);
}
