import { Users, prisma } from '../utils/prisma.server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { userHash } from '../utils/format.server';

dotenv.config();
const secret = process.env.SECRET;

export class authServices {
  static async auth({ email, password }: Pick<Users, 'email' | 'password'>) {
    try {
      const user = await prisma.users.findUnique({
        where: { email },
        select: {
          id: true,
          role: true,
          password: true,
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              dni: true,
              phone: true,
            },
          },
        },
      });
      if (!user) return false;
      const verifyPassword = await bcrypt.compare(password, user.password);
      if (!verifyPassword) return null;
      return user;
    } catch (error) {
      throw error;
    }
  }

  static getToken(data: userHash) {
    try {
      if (secret) {
        const token = jwt.sign(data, secret, { algorithm: 'HS512' });
        return token;
      }
    } catch (error) {
      throw error;
    }
  }
}
export default authServices;
