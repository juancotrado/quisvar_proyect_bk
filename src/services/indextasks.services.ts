import { IndexTasks } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

class IndexTasksServices {
  static async find(id: IndexTasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findIndexTask = await prisma.indexTasks.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        tasks: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!findIndexTask) throw new AppError('Could not found work areas', 404);
    return findIndexTask;
  }
  static async create({ name, workAreaId }: IndexTasks) {
    const newTask = prisma.indexTasks.create({
      data: {
        name,
        workArea: {
          connect: {
            id: workAreaId,
          },
        },
      },
    });
    return newTask;
  }
  static async update(id: IndexTasks['id'], { name }: IndexTasks) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateTask = await prisma.indexTasks.update({
      where: { id },
      data: {
        name,
      },
    });
    return updateTask;
  }
  static async delete(id: IndexTasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const deleteTask = await prisma.indexTasks.delete({
      where: { id },
    });
    return deleteTask;
  }
}
export default IndexTasksServices;
