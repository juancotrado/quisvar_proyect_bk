import { Task_lvl_2, Tasks } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

class Task_2_Services {
  static async findTask(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findTask = await prisma.tasks.findUnique({ where: { id } });
    if (!findTask) throw new AppError('No se pudo encontrar la tarea', 404);
    return findTask;
  }
  static async create({ name, taskId }: Task_lvl_2) {
    const getIndex = await prisma.task_lvl_2.count({ where: { taskId } });
    const _task = await this.findTask(taskId);
    const newTaskLvl2 = await prisma.task_lvl_2.create({
      data: {
        name,
        item: `${_task.item}.${getIndex + 1}`,
        task: {
          connect: { id: taskId },
        },
      },
    });
    return newTaskLvl2;
  }
  static async update(id: Task_lvl_2['id'], { name }: Task_lvl_2) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateTaskLvl2 = await prisma.task_lvl_2.update({
      where: { id },
      data: { name },
    });
    return updateTaskLvl2;
  }
  static async delete(id: Task_lvl_2['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
  }
}
export default Task_2_Services;
