import { IndexTasks, SubTasks, Tasks, WorkAreas } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import fs from 'fs';
import { renameDir } from '../utils/fileSystem';
import PathServices from './paths.services';
class IndexTasksServices {
  static async find(id: IndexTasks['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const findIndexTask = await prisma.indexTasks.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        tasks: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!findIndexTask)
      throw new AppError('No se pudieron encontrar las áreas de trabajo', 404);
    return findIndexTask;
  }

  static async findSubtasks(id: IndexTasks['id'], status?: SubTasks['status']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findTask = await prisma.indexTasks.findUnique({
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
              include: {
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
                assignedAt: true,
                untilDate: true,
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
  static async findShort(id: IndexTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findIndexTask = await prisma.indexTasks.findUnique({
      where: { id },
    });
    if (!findIndexTask)
      throw new AppError('No se pudo encontrar las areas de trabajo', 404);
    return findIndexTask;
  }

  static async findArea(id: WorkAreas['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findArea = await prisma.workAreas.findUnique({
      where: { id },
      include: { project: { select: { unique: true } } },
    });
    if (!findArea) throw new AppError('No se pudo encontrar las areas', 404);
    return findArea;
  }

  static async create({ name, workAreaId, unique }: IndexTasks) {
    const getIndex = await prisma.indexTasks.count({ where: { workAreaId } });
    const _area = await this.findArea(workAreaId);
    console.log();
    const newTask = await prisma.indexTasks.create({
      data: {
        name,
        unique,
        item: _area.project.unique
          ? `${getIndex + 1}`
          : `${_area.item}.${getIndex + 1}`,
        workArea: {
          connect: {
            id: workAreaId,
          },
        },
      },
    });
    return newTask;
  }

  static async update(id: IndexTasks['id'], { name, unique }: IndexTasks) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateTask = await prisma.indexTasks.update({
      where: { id },
      data: {
        name,
        unique,
      },
    });
    return updateTask;
  }

  static async delete(id: IndexTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const { workAreaId } = await this.findShort(id);
    const dirArea = await PathServices.pathArea(workAreaId);
    const deleteTask = await prisma.indexTasks.delete({
      where: { id },
    });
    const getTasks = await prisma.indexTasks.findMany({
      where: { workAreaId },
      orderBy: { id: 'asc' },
      include: { workArea: { select: { item: true } } },
    });
    getTasks.forEach(async (task, index) => {
      const _task = await prisma.indexTasks.update({
        where: { id: task.id },
        data: {
          item: task.workArea.item
            ? `${index + 1}`
            : `${task.workArea.item}.${index + 1}`,
        },
      });
      const oldDir = dirArea + '/' + task.item + '.' + task.name;
      const newDir = dirArea + '/' + _task.item + '.' + _task.name;
      renameDir(oldDir, newDir);
    });
    return deleteTask;
  }
}
export default IndexTasksServices;
