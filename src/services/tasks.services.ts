import { Tasks, WorkAreas, prisma } from '../utils/prisma.server';
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
  static async update(
    id: Tasks['id'],
    { name, description, price, id_area }: Tasks & { id_area: WorkAreas['id'] }
  ) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateTask = await prisma.tasks.update({
      where: { id },
      data: {
        name,
        description,
        price,
        WorkArea: {
          connect: { id: id_area },
        },
      },
    });
    return updateTask;
  }

  static async updateStatus(id: Tasks['id'], status: Tasks['status']) {
    const updateTaskStatus = await prisma.tasks.update({
      where: { id },
      data: {
        status,
      },
      select: {
        id: true,
        status: true,
      },
    });
    return updateTaskStatus;
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
