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
}
export default IndexTasksServices;
