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
        projects: {
          select: { id: true, name: true },
        },
        employees: {
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
    employees: { [id: string]: Users['id'] }[];
  }) {
    const newTask = prisma.tasks.create({
      data: {
        name,
        projects: {
          connect: {
            id: project_id,
          },
        },
        employees: {
          connect: employees,
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
        employees: {
          connect: { id: 2 },
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
