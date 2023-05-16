import { error } from 'console';
import AppError from '../utils/appError';
import { userProfilePick } from '../utils/format.server';
import { Users, Tasks, prisma } from '../utils/prisma.server';
import bcrypt from 'bcryptjs';

class UsersServices {
  static async getAll() {
    try {
      const users = await prisma.users.findMany({
        orderBy: { profile: { firstName: 'asc' } },
        include: { profile: true },
      });
      if (users.length == 0) {
        throw new AppError('Could not found user logs', 404);
      }
      return users;
    } catch (error) {
      throw error;
    }
  }

  static async find(id: Users['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findUser = await prisma.users.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        profile: true,
      },
    });
    if (!findUser) throw new AppError('Could not found user ', 404);
    return findUser;
  }

  static async findListTask(id: Users['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findTaskUser = await prisma.users.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        tasks: {
          select: {
            assignedAt: true,
            task: {
              select: {
                id: true,
                subtasks: true,
              },
            },
          },
        },
      },
    });
    if (!findTaskUser) throw new AppError('Could not found user ', 404);
    return findTaskUser;
  }

  static async create({
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
