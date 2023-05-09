import AppError from '../utils/appError';
import { Tasks, prisma } from '../utils/prisma.server';

class tasksServices {
  static async getTasks() {
    try {
      const task = await prisma.tasks.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          WorkArea: {
            select: {
              id: true,
              name: true,
            },
          },
          UsersOnTasks: {
            select: {
              user: {
                select: { profile: true },
              },
            },
          },
        },
      });
      return task;
    } catch (error) {
      throw error;
    }
  }

  static async get(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findTask = await prisma.tasks.findUnique({
      where: { id },
      include: {
        WorkArea: {
          select: {
            name: true,
          },
        },
        UsersOnTasks: {
          select: { user: { select: { profile: true } } },
        },
      },
    });
    if (!findTask) throw new AppError('Could not be found task', 404);
    return findTask;
  }
}
export default tasksServices;
