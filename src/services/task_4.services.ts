import { Task_lvl_3, Task_lvl_4 } from '@prisma/client';
import AppError from '../utils/appError';
import { prisma } from '../utils/prisma.server';
import PathServices from './paths.services';
import { renameDir } from '../utils/fileSystem';
import Queries from '../utils/queries';

class Task_4_Services {
  static async find(id: Task_lvl_4['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findTaskLvl4 = await prisma.task_lvl_4.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        subTasks: {
          include: Queries.includeSubtask,
        },
      },
    });
    return findTaskLvl4;
  }

  static async findTaskLvl3(id: Task_lvl_3['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findTaskLvl_3 = await prisma.task_lvl_3.findUnique({ where: { id } });
    if (!findTaskLvl_3)
      throw new AppError('No se pudo encontrar la tarea', 404);
    return findTaskLvl_3;
  }

  static async findShort(id: Task_lvl_4['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findTaskLvl_4 = await prisma.task_lvl_4.findUnique({ where: { id } });
    if (!findTaskLvl_4)
      throw new AppError('No se pudo encontrar la tarea de nivel 4', 404);
    return findTaskLvl_4;
  }

  static async create({ name, task_3_Id, unique, item }: Task_lvl_4) {
    const _task_3 = await this.findTaskLvl3(task_3_Id);
    const newTaskLvl_4 = await prisma.task_lvl_4.create({
      data: {
        name,
        unique,
        item: `${_task_3.item}.${item}`,
        task_3: { connect: { id: task_3_Id } },
      },
    });
    return newTaskLvl_4;
  }

  static async update(
    id: Task_lvl_3['id'],
    { name, unique, item }: Task_lvl_3
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateTaskLvl_3 = await prisma.task_lvl_3.update({
      where: { id },
      data: { name, unique, item },
    });
    return updateTaskLvl_3;
  }

  // static async delete(id: Task_lvl_3['id']) {
  //   if (!id) throw new AppError('Oops!,ID invalido', 400);
  //   const { task_2_Id } = await this.findShort(id);
  //   const dirTaskLvl_2 = await PathServices.pathTask2(task_2_Id);
  //   const deleteTaskLvl_3 = await prisma.task_lvl_3.delete({ where: { id } });
  //   const getTasksLvl_3 = await prisma.task_lvl_3.findMany({
  //     where: { task_2_Id },
  //     include: {
  //       task_2: { select: { item: true } },
  //     },
  //   });
  //   getTasksLvl_3.forEach(async (task_3, index) => {
  //     const _task_3 = await prisma.task_lvl_3.update({
  //       where: { id: task_3.id },
  //       data: { item: `${task_3.task_2.item}.${index + 1}` },
  //     });
  //     const oldDir = dirTaskLvl_2 + '/' + task_3.item + '.' + task_3.name;
  //     const newDir = dirTaskLvl_2 + '/' + _task_3.item + '.' + _task_3.name;
  //     renameDir(oldDir, newDir);
  //   });
  //   return deleteTaskLvl_3;
  // }
}
export default Task_4_Services;
