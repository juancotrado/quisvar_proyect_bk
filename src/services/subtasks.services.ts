import {
  Projects,
  SubTasks,
  Tasks,
  Users,
  prisma,
} from '../utils/prisma.server';
import AppError from '../utils/appError';

class SubTasksServices {
  static async find(id: SubTasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findSubTask = await prisma.subTasks.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            user: {
              select: {
                profile: true,
              },
            },
          },
        },
        task: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!findSubTask) throw new AppError('Could not found task ', 404);
    return findSubTask;
  }

  static async create({
    name,
    price,
    hours,
    description,
    taskId,
  }: SubTasks & { taskId: Tasks['id'] }) {
    const newTask = prisma.subTasks.create({
      data: {
        name,
        price,
        description,
        hours,
        task: {
          connect: { id: taskId },
        },
      },
    });
    return newTask;
  }

  static async assigned(
    id: SubTasks['id'],
    userId: Users['id'],
    option: 'decline' | 'apply' | 'done'
  ) {
    if (option == 'decline') {
      return await prisma.subTasks.update({
        where: { id },
        data: {
          status: 'UNRESOLVED',
          users: {
            delete: {
              subtaskId_userId: {
                subtaskId: id,
                userId,
              },
            },
          },
        },
      });
    }
    if (option == 'apply') {
      return await prisma.subTasks.update({
        where: { id },
        data: {
          status: 'PROCESS',
          users: {
            create: {
              userId,
            },
          },
        },
      });
    }
    if (option == 'done') {
      return prisma.subTasks.update({
        where: { id },
        data: {
          status: 'DONE',
        },
      });
    }
    throw new AppError('Oops!,We need status for this query', 400);
  }

  static async update(
    id: SubTasks['id'],
    { name, hours, price, description, percentage }: SubTasks
  ) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateTask = await prisma.subTasks.update({
      where: { id },
      data: {
        name,
        hours,
        price,
        description,
        percentage,
      },
    });
    return updateTask;
  }

  static async delete(id: SubTasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const deleteTask = await prisma.subTasks.delete({
      where: { id },
    });
    return deleteTask;
  }
}
export default SubTasksServices;
