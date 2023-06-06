import { IndexTasks, SubTasks, Tasks, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import fs from 'fs';
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

  static async findShort(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findTask = await prisma.tasks.findUnique({
      where: { id },
    });
    if (!findTask) throw new AppError('Could not found task ', 404);
    return findTask;
  }

  static async findIndexTask(id: IndexTasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findArea = await prisma.indexTasks.findUnique({
      where: { id },
    });
    if (!findArea) throw new AppError('Could not found area', 404);
    return findArea;
  }

  static async create({ name, indexTaskId }: Tasks) {
    const getIndex = await prisma.tasks.count({ where: { indexTaskId } });
    const _index_task = await this.findIndexTask(indexTaskId);
    const newTask = await prisma.tasks.create({
      data: {
        name,
        dir: `${_index_task.dir}/${_index_task.item}.${_index_task.name}`,
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
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateTask = await prisma.tasks.update({
      where: { id },
      data: {
        name,
      },
    });
    return updateTask;
  }

  static async delete(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const { indexTaskId } = await this.findShort(id);
    const deleteTask = await prisma.tasks.delete({
      where: { id },
    });
    if (deleteTask) {
      const getTasks = await prisma.tasks.findMany({
        where: { indexTaskId },
        include: {
          indexTask: { select: { item: true } },
        },
      });
      getTasks.forEach(async (task, index) => {
        const _task = await prisma.tasks.update({
          where: { id: task.id },
          data: { item: `${task.indexTask.item}.${index + 1}` },
        });
        const oldDir = task.dir + '/' + task.item + '.' + task.name;
        const newDir = _task.dir + '/' + _task.item + '.' + _task.name;
        fs.renameSync(oldDir, newDir);
      });
    }
    return deleteTask;
  }
}
export default TasksServices;
