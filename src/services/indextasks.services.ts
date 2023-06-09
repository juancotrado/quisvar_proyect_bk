import { IndexTasks, WorkAreas } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import fs from 'fs';
import { renameDir } from '../utils/fileSystem';
import PathServices from './paths.services';
class IndexTasksServices {
  static async find(id: IndexTasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
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
    if (!findIndexTask) throw new AppError('Could not found work areas', 404);
    return findIndexTask;
  }

  static async findShort(id: IndexTasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findIndexTask = await prisma.indexTasks.findUnique({
      where: { id },
    });
    if (!findIndexTask) throw new AppError('Could not found work areas', 404);
    return findIndexTask;
  }

  static async findArea(id: WorkAreas['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findArea = await prisma.workAreas.findUnique({
      where: { id },
    });
    if (!findArea) throw new AppError('Could not found area', 404);
    return findArea;
  }

  static async create({ name, workAreaId }: IndexTasks) {
    const getIndex = await prisma.indexTasks.count({ where: { workAreaId } });
    const _area = await this.findArea(workAreaId);
    const newTask = await prisma.indexTasks.create({
      data: {
        name,
        item: `${_area.item}.${getIndex + 1}`,
        workArea: {
          connect: {
            id: workAreaId,
          },
        },
      },
    });
    return newTask;
  }

  static async update(id: IndexTasks['id'], { name }: IndexTasks) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateTask = await prisma.indexTasks.update({
      where: { id },
      data: {
        name,
      },
    });
    return updateTask;
  }

  static async delete(id: IndexTasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const { workAreaId } = await this.findShort(id);
    const dirArea = await PathServices.pathArea(workAreaId);
    const deleteTask = await prisma.indexTasks.delete({
      where: { id },
    });
    const getTasks = await prisma.indexTasks.findMany({
      where: { workAreaId },
      include: { workArea: { select: { item: true } } },
    });
    getTasks.forEach(async (task, index) => {
      const _task = await prisma.indexTasks.update({
        where: { id: task.id },
        data: { item: `${task.workArea.item}.${index + 1}` },
      });
      const oldDir = dirArea + '/' + task.item + '.' + task.name;
      const newDir = dirArea + '/' + _task.item + '.' + _task.name;
      renameDir(oldDir, newDir);
    });
    return deleteTask;
  }
}
export default IndexTasksServices;
