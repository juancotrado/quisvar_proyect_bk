import { error } from 'console';
import AppError from '../utils/appError';
import { userProfilePick } from '../utils/format.server';
import { Users, prisma } from '../utils/prisma.server';
import bcrypt from 'bcryptjs';

class UsersServices {
  static async getUsers() {
    try {
      const users = await prisma.users.findMany({
        orderBy: { profile: { firstName: 'asc' } },
        include: { profile: true },
      });
      return users;
    } catch (error) {
      throw error;
    }
  }

  static async createUser({
    email,
    password,
    firstName,
    lastName,
    dni,
    phone,
  }: userProfilePick) {
    const passwordHash = await bcrypt.hash(password, 10);
    const findUserByDNI = await prisma.profiles.findUnique({
      where: { dni },
    });
    if (findUserByDNI)
      throw new AppError('Oops!, DNI has been registered', 404);
    const newUser = await prisma.users.create({
      data: {
        email,
        password: passwordHash,
      },
    });
    if (newUser) {
      await prisma.profiles.create({
        data: {
          firstName,
          lastName,
          dni,
          phone,
          user: {
            connect: {
              id: newUser.id,
            },
          },
        },
      });
    }
    return newUser;
  }

  static async update(
    id: Users['id'],
    { role, status }: Pick<Users, 'role' | 'status'>
  ) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateUser = await prisma.users.update({
      where: { id },
      data: {
        role,
        status,
      },
    });
    return updateUser;
  }

  static async delete(id: Users['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const deleteUser = await prisma.users.delete({
      where: { id },
    });
    return deleteUser;
  }
}
export default UsersServices;
