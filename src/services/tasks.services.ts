import {
  Projects,
  Tasks,
  Users,
  WorkAreas,
  prisma,
} from '../utils/prisma.server';
import AppError from '../utils/appError';

class TasksServices {
  // static async getTask() {
  //   try {
  //     const task = await prisma.workAreas.findMany({
  //       include: {
  //         _count: true,
  //         projects: { select: { id: true } },
  //       },
  //     });
  //     return task;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  static async find(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findTask = await prisma.tasks.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        project: {
          select: { id: true, name: true },
        },
        employees: {
          select: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    dni: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        subtasks: true,
      },
    });
    if (!findTask) throw new AppError('Could not found task ', 404);
    return findTask;
  }

  static async create({
    name,
    project_id,
    employees,
  }: Tasks & { project_id: Projects['id'] } & {
    employees: { userId: Users['id'] }[];
  }) {
    const newTask = prisma.tasks.create({
      data: {
        name,
        project: {
          connect: {
            id: project_id,
          },
        },
        employees: {
          create: employees,
        },
      },
    });
    return newTask;
  }
  static async assigned(id: Tasks['id'], userId: Users['id'], option: string) {
    if (option == 'decline') {
      console.log(id, userId, option);
      const declineTask = prisma.tasks.update({
        where: { id },
        data: {
          employees: {
            delete: {
              taskId_userId: {
                taskId: id,
                userId,
              },
            },
          },
        },
      });
      return declineTask;
    }
    if (option == 'apply') {
      const applyTask = prisma.tasks.update({
        where: { id },
        data: {
          employees: {
            create: {
              userId,
            },
          },
        },
      });
      return applyTask;
    }
    throw new AppError('Oops!,We need status for this query', 400);
  }
  static async update(
    id: Tasks['id'],
    {
      name,
      employees,
    }: Tasks & { project_id: Projects['id'] } & {
      employees: { userId: Users['id'] }[];
    }
  ) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateTask = await prisma.tasks.update({
      where: { id },
      data: {
        name,
        employees: {
          deleteMany: { taskId: id },
          create: employees,
        },
      },
    });
    return updateTask;
  }

  static async updateStatus(id: Tasks['id'], { status }: Tasks) {
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
export default TasksServices;
