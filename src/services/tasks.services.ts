import { IndexTasks, SubTasks, Tasks, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import fs from 'fs';
import PathServices from './paths.services';
import { renameDir } from '../utils/fileSystem';
class TasksServices {
  static async find(id: Tasks['id'], status?: SubTasks['status']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
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
            files: {
              select: {
                dir: true,
                name: true,
                subTasksId: true,
                type: true,
                user: {
                  select: {
                    profile: {
                      select: { id: true, firstName: true, lastName: true },
                    },
                  },
                },
              },
            },
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
    if (!findTask) throw new AppError('No se pudo encontrar la tarea ', 404);
    return findTask;
  }

  static async findShort(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findTask = await prisma.tasks.findUnique({
      where: { id },
    });
    if (!findTask) throw new AppError('No se pudo encontrar la tarea ', 404);
    return findTask;
  }

  static async findIndexTask(id: IndexTasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findArea = await prisma.indexTasks.findUnique({
      where: { id },
    });
    if (!findArea) throw new AppError('No se pudo encontrar el area', 404);
    return findArea;
  }

  static async create({ name, indexTaskId }: Tasks) {
    const getIndex = await prisma.tasks.count({ where: { indexTaskId } });
    const _index_task = await this.findIndexTask(indexTaskId);
    const newTask = await prisma.tasks.create({
      data: {
        name,
        item: `${_index_task.item}.${getIndex + 1}`,
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
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateTask = await prisma.tasks.update({
      where: { id },
      data: {
        name,
      },
    });
    return updateTask;
  }

  static async delete(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const { indexTaskId } = await this.findShort(id);
    const dirIndexTask = await PathServices.pathIndexTask(indexTaskId);
    const deleteTask = await prisma.tasks.delete({
      where: { id },
    });
    const getTasks = await prisma.tasks.findMany({
      where: { indexTaskId },
      orderBy: { id: 'asc' },
      include: {
        indexTask: { select: { item: true } },
      },
    });
    getTasks.forEach(async (task, index) => {
      const _task = await prisma.tasks.update({
        where: { id: task.id },
        data: { item: `${task.indexTask.item}.${index + 1}` },
      });
      const oldDir = dirIndexTask + '/' + task.item + '.' + task.name;
      const newDir = dirIndexTask + '/' + _task.item + '.' + _task.name;
      renameDir(oldDir, newDir);
    });
    return deleteTask;
  }
}
export default TasksServices;
