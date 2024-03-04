import { Profiles, Users, prisma } from '../utils/prisma.server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import AppError from '../utils/appError';

dotenv.config();
const secret = process.env.SECRET || 'patito juan';
const JWT_RESET = process.env.JWT_RESET || 'JWT_RESET';

export class authServices {
  static async auth({
    password,
    dni,
  }: Pick<Users, 'password'> & { dni: Profiles['dni'] }) {
    const user = await prisma.users.findFirst({
      where: { profile: { dni } },
      select: {
        id: true,
        role: true,
        password: true,
        status: true,
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

    if (!user) throw new AppError('Usuario inexistente', 404);
    const verifyPassword = await bcrypt.compare(password, user.password);
    if (!verifyPassword)
      throw new AppError(
        'Credenciales incorrectas. Verifique su usuario y contraseña.',
        401
      );
    return user;
  }

  static getToken(id: number) {
    if (secret) {
      const token = jwt.sign({ id }, secret, { algorithm: 'HS512' });
      return token;
    }
  }
  static getTokenToResetPassword(id: number, dni: string) {
    const token = jwt.sign({ id, dni }, JWT_RESET, { expiresIn: '3m' });
    return token;
  }

  static async updatePassword(id: Users['id'], password: string) {
    if (!id || !password) throw new AppError('Oops!,ID invalido', 400);
    const passwordHash = await bcrypt.hash(password, 10);
    const updatePassword = await prisma.users.update({
      where: { id },
      data: { password: passwordHash },
      select: {
        id: true,
        role: true,
        password: true,
        status: true,
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
    return updatePassword;
  }
}
export default authServices;
