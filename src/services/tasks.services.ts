import {
  Projects,
  Tasks,
  Users,
  WorkAreas,
  prisma,
} from '../utils/prisma.server';
import AppError from '../utils/appError';

class TasksServices {
  static async find(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findTask = await prisma.tasks.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        subTasks: {
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

  // static async create({
  //   name,
  //   projectId,
  //   employees,
  // }: Tasks & { projectId: Projects['id'] } & {
  //   employees: { userId: Users['id'] }[];
  // }) {
  //   const newTask = prisma.tasks.create({
  //     data: {
  //       name,
  //       project: {
  //         connect: {
  //           id: projectId,
  //         },
  //       },
  //       employees: {
  //         create: employees,
  //       },
  //     },
  //     include: {
  //       employees: true,
  //     },
  //   });
  //   return newTask;
  // }

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
  // static async update(
  //   id: Tasks['id'],
  //   {
  //     name,
  //     employees,
  //   }: Tasks & { project_id: Projects['id'] } & {
  //     // employees: { userId: Users['id'] }[];
  //     employees: { user: { profile: { userId: Users['id'] } } }[];
  //   }
  // ) {
  //   const parseUsers = employees.map(user => ({
  //     userId: user.user.profile.userId,
  //   }));
  //   if (!id) throw new AppError('Oops!,Invalid ID', 400);
  //   const updateTask = await prisma.tasks.update({
  //     where: { id },
  //     data: {
  //       name,
  //       employees: {
  //         deleteMany: { taskId: id },
  //         create: parseUsers,
  //       },
  //     },
  //     include: {
  //       employees: {
  //         select: {
  //           taskId: true,
  //           userId: true,
  //           assignedAt: true,
  //           user: {
  //             select: {
  //               profile: {
  //                 select: {
  //                   firstName: true,
  //                   userId: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  //   return updateTask;
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

  // static async delete(id: Tasks['id']) {
  //   if (!id) throw new AppError('Oops!,Invalid ID', 400);
  //   const deleteTask = await prisma.tasks.delete({
  //     where: { id },
  //   });
  //   return deleteTask;
  // }
}
export default TasksServices;
