import { Task_lvl_2, Tasks } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import PathServices from './paths.services';
import { renameDir } from '../utils/fileSystem';

class Task_2_Services {
  static async find(id: Task_lvl_2['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findTaskLvl2 = await prisma.task_lvl_2.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
    return findTaskLvl2;
  }

  static async findTask(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findTask = await prisma.tasks.findUnique({ where: { id } });
    if (!findTask) throw new AppError('No se pudo encontrar la tarea', 404);
    return findTask;
  }

  static async findShort(id: Task_lvl_2['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findTaskLvl2 = await prisma.task_lvl_2.findUnique({ where: { id } });
    if (!findTaskLvl2)
      throw new AppError('No se pudo encontrar la tarea de nivel 2', 404);
    return findTaskLvl2;
  }

  static async create({
    name,
    taskId,
    unique,
  }: Pick<Task_lvl_2, 'name' | 'taskId' | 'unique'>) {
    const getIndex = await prisma.task_lvl_2.count({ where: { taskId } });
    const _task = await this.findTask(taskId);
    const newTaskLvl2 = await prisma.task_lvl_2.create({
      data: {
        name,
        unique,
        item: `${_task.item}.${getIndex + 1}`,
        task: {
          connect: { id: taskId },
        },
      },
    });
    return newTaskLvl2;
  }

  static async update(id: Task_lvl_2['id'], { name, unique }: Task_lvl_2) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateTaskLvl2 = await prisma.task_lvl_2.update({
      where: { id },
      data: { name, unique },
    });
    return updateTaskLvl2;
  }

  static async delete(id: Task_lvl_2['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const { taskId } = await this.findShort(id);
    const dirTask = await PathServices.pathTask(taskId);
    const deleteTaskLvl_2 = await prisma.task_lvl_2.delete({ where: { id } });
    const getTasksLvl_2 = await prisma.task_lvl_2.findMany({
      where: { taskId },
      include: {
        task: { select: { item: true } },
      },
    });
    getTasksLvl_2.forEach(async (task_2, index) => {
      const _task_2 = await prisma.task_lvl_2.update({
        where: { id: task_2.id },
        data: { item: `${task_2.task.item}.${index + 1}` },
      });
      const oldDir = dirTask + '/' + task_2.item + '.' + task_2.name;
      const newDir = dirTask + '/' + _task_2.item + '.' + _task_2.name;
      renameDir(oldDir, newDir);
    });
    return deleteTaskLvl_2;
  }
}
export default Task_2_Services;
