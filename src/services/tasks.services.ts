import { Tasks, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
class tasksServices {
  static async getTask() {
    try {
      const task = await prisma.tasks.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return task;
    } catch (error) {
      throw error;
    }
  }
  static async find(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findTask = await prisma.tasks.findUnique({
      where: { id },
      include: {
        WorkArea: {
          select: { name: true },
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
    if (!findTask) throw new AppError('Could not found task ', 404);
    return findTask;
  }

  static async delete(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const deleteTask = await prisma.tasks.delete({
      where: { id },
    });
    return deleteTask;
  }
}
export default tasksServices;
