import { IndexTasks, SubTasks, Tasks, WorkAreas } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { parsePath, renameDir } from '../utils/fileSystem';
import PathServices from './paths.services';
import Queries from '../utils/queries';
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
      select: { item: true },
    });
    if (!findArea) throw new AppError('No se pudo encontrar el índice', 404);
    return findArea;
  }

  static async findDuplicate(name: string, id: number, type: 'AREA' | 'ID') {
    let workAreaId;
    workAreaId = id;
    if (type === 'ID') {
      const getIdArea = await prisma.indexTasks.findUnique({
        where: { id },
        select: { workAreaId: true, workArea: { select: { item: true } } },
      });
      if (!getIdArea) throw new AppError('No se pudo encontrar el índice', 404);
      workAreaId = getIdArea.workAreaId;
    }
    const area = await prisma.workAreas.findUnique({
      where: { id: workAreaId },
      select: { item: true, indexTasks: { select: { name: true } } },
    });
    if (!area) throw new AppError('No se pudo encontrar el índice', 404);
    const { item, indexTasks } = area;
    const duplicated = indexTasks.map(({ name }) => name).includes(name);
    const quantity = indexTasks.length;
    return { duplicated, quantity, areaItem: item, workAreaId };
  }

  static async create({ name, workAreaId, unique, item }: IndexTasks) {
    const findDuplicate = await this.findDuplicate(name, workAreaId, 'AREA');
    const { duplicated, quantity, areaItem } = findDuplicate;
    if (duplicated) throw new AppError('Error al crear, Nombre existente', 404);
    const newItem = areaItem + '.' + `${item ? item : quantity + 1}`;
    const newTask = await prisma.indexTasks.create({
      data: {
        name,
        unique,
        item: newItem,
        workArea: { connect: { id: workAreaId } },
      },
    });
    return newTask;
  }

  static async update(id: IndexTasks['id'], { name, unique }: IndexTasks) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const { duplicated } = await this.findDuplicate(name, id, 'ID');
    if (duplicated) throw new AppError('Error al crear, Nombre existente', 404);
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
      select: { id: true, item: true },
    });
    const getTasks = await prisma.indexTasks.findMany({
      where: { workAreaId, item: { gt: deleteTask.item } },
      orderBy: { id: 'asc' },
    });
    const newListTask = getTasks.map(async ({ id, item, name }, index) => {
      const newItem = (+deleteTask.item + index).toString();
      const _task = await prisma.indexTasks.update({
        where: { id },
        data: { item: newItem },
      });
      const oldDir = dirArea + parsePath(item, name);
      const newDir = dirArea + parsePath(_task.item, _task.name);
      renameDir(oldDir, newDir);
    });
    const result = await Promise.all(newListTask).then(() => dirArea);
    return result;
  }
}
export default IndexTasksServices;
