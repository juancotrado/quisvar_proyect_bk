import { Profiles, Users, prisma } from '../utils/prisma.server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { userHash } from '../utils/format.server';
import AppError from '../utils/appError';

dotenv.config();
const secret = process.env.SECRET;

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
    if (!verifyPassword) throw new AppError('contraseña incorrecta', 404);
    return user;
  }

  static getToken(data: userHash) {
    if (secret) {
      const token = jwt.sign(data, secret, { algorithm: 'HS512' });
      return token;
    }
  }

  static async updatePassword(id: Users['id'], { password }: Users) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const passwordHash = await bcrypt.hash(password, 10);
    const updatePassword = await prisma.users.update({
      where: { id },
      data: { password: passwordHash },
    });
    return updatePassword;
  }
}
export default authServices;
