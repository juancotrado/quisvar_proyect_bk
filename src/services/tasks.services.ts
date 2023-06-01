import {
  Projects,
  SubTasks,
  Tasks,
  Users,
  WorkAreas,
  prisma,
} from '../utils/prisma.server';
import AppError from '../utils/appError';

class TasksServices {
  static async find(id: Tasks['id'], status?: SubTasks['status']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findTask = await prisma.tasks.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        subTasks: {
          where: {
            status,
          },
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
          },
        },
      },
    });
    if (!findTask) throw new AppError('Could not found task ', 404);
    return findTask;
  }

  static async create({ name, indexTaskId }: Tasks) {
    const newTask = prisma.tasks.create({
      data: {
        name,
        indexTask: {
          connect: {
            id: indexTaskId,
          },
        },
      },
    });
    return newTask;
  }

  static async update(id: Tasks['id'], { name }: Tasks) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateTask = await prisma.tasks.update({
      where: { id },
      data: {
        name,
      },
    });
    return updateTask;
  }

  // static async assigned(id: Tasks['id'], userId: Users['id'], option: string) {
  //   if (option == 'decline') {
  //     console.log(id, userId, option);
  //     const declineTask = prisma.tasks.update({
  //       where: { id },
  //       data: {
  //         employees: {
  //           delete: {
  //             taskId_userId: {
  //               taskId: id,
  //               userId,
  //             },
  //           },
  //         },
  //         status: 'UNRESOLVED',
  //       },
  //     });
  //     return declineTask;
  //   }
  //   if (option == 'apply') {
  //     const applyTask = prisma.tasks.update({
  //       where: { id },
  //       data: {
  //         employees: {
  //           create: {
  //             userId,
  //           },
  //         },
  //         status: 'PROCESS',
  //       },
  //     });
  //     return applyTask;
  //   }
  //   if (option == 'done') {
  //     const doneTask = prisma.tasks.update({
  //       where: { id },
  //       data: {
  //         status: 'DONE',
  //       },
  //     });
  //     return doneTask;
  //   }
  //   throw new AppError('Oops!,We need status for this query', 400);
  // }

  // static async updateStatus(id: Tasks['id'], { status }: Tasks) {
  //   const updateTaskStatus = await prisma.tasks.update({
  //     where: { id },
  //     data: {
  //       status,
  //     },
  //     select: {
  //       id: true,
  //       status: true,
  //     },
  //   });
  //   return updateTaskStatus;
  // }

  static async delete(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const deleteTask = await prisma.tasks.delete({
      where: { id },
    });
    return deleteTask;
  }
}
export default TasksServices;
