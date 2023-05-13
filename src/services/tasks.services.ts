import {
  Projects,
  Tasks,
  Users,
  WorkAreas,
  prisma,
} from '../utils/prisma.server';
import AppError from '../utils/appError';

class TasksServices {
  static async getTask() {
    try {
      const task = await prisma.workAreas.findMany({
        include: {
          _count: true,
          projects: { select: { id: true } },
        },
      });
      const url = ' http://localhost:8081/api/v1/projects';
      const newTask = task;
      return task;
    } catch (error) {
      throw error;
    }
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
