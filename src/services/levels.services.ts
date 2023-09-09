import { Levels } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import PathLevelServices from './path_levels.services';
import {
  parsePath,
  parsePathLevel,
  renameDir,
  setNewPath,
} from '../utils/fileSystem';
import Queries from '../utils/queries';
import {
  getDetailsSubtask,
  percentageSubTasks,
  sumValues,
} from '../utils/tools';

class LevelsServices {
  static async find(id: Levels['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const findProject = await prisma.levels.findUnique({
      where: { id },
      select: {
        stages: { select: { project: { select: { percentage: true } } } },
      },
    });
    if (!findProject || !findProject.stages)
      throw new AppError('Oops!, proyecto invalido', 400);
    const { project } = findProject.stages;
    if (!project) throw new AppError('Oops!, proyecto invalido', 400);
    const findLevel = await this.findList(id, project.percentage);
    return findLevel;
  }

  static async findShort(id: Levels['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const findLevel = await prisma.levels.findUnique({ where: { id } });
    if (!findLevel)
      throw new AppError('No se pudieron encontrar el nivel', 404);
    return findLevel;
  }

  static async findDuplicate(
    name: string,
    id: number,
    type: 'ROOT' | 'ID',
    stagesId?: number
  ) {
    let rootId;
    rootId = id;
    if (type === 'ID') {
      const getRootId = await prisma.levels.findUnique({
        where: { id },
        select: { rootId: true, rootLevel: true },
      });
      if (!getRootId) throw new AppError('No se pudo encontrar el índice', 404);
      rootId = getRootId.rootId;
    }
    const root = await prisma.levels.findUnique({
      where: { id: rootId },
      select: { name: true, item: true, level: true, stagesId: true },
    });
    const getLevels = await prisma.levels.groupBy({
      by: ['name'],
      where: { rootId, stagesId: root ? root.stagesId : stagesId },
    });
    if (!getLevels) throw new AppError('No se pudo encontrar la lista ', 404);
    const duplicated = getLevels.map(({ name }) => name).includes(name);
    const quantity = getLevels.length;
    return {
      duplicated,
      quantity,
      rootItem: root ? root.item : null,
      rootLevel: root ? root.level : 0,
      rootId,
    };
  }

  static async create({ item, name, level, stagesId, rootId, unique }: Levels) {
    if (!stagesId) throw new AppError('Oops!,ID invalido', 400);
    const isDuplicated = await this.findDuplicate(
      name,
      rootId,
      'ROOT',
      stagesId
    );
    const { duplicated, rootItem, quantity, rootLevel } = isDuplicated;
    if (duplicated) throw new AppError('Error al crear, Nombre existente', 404);
    const newRootItem = rootItem ? rootItem + '.' : '';
    const newItem = newRootItem + `${item ? item : quantity + 1}`;
    const newLevel = await prisma.levels.create({
      data: {
        rootId,
        item: newItem,
        name,
        rootLevel,
        level: rootLevel + 1,
        unique,
        stages: { connect: { id: stagesId } },
      },
    });
    return newLevel;
  }

  static async update(id: Levels['id'], { name, unique }: Levels) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const { duplicated } = await this.findDuplicate(name, id, 'ID');
    if (duplicated) throw new AppError('Error al crear, Nombre existente', 404);
    const updateLevel = await prisma.levels.update({
      where: { id },
      data: { name, unique },
    });
    return updateLevel;
  }

  static async delete(id: Levels['id']) {
    if (!id) throw new AppError('Oops!,ID invalido?', 400);
    const { rootId, item } = await this.findShort(id);
    const newDir = await PathLevelServices.pathLevel(id);
    const dirLevel = setNewPath(newDir, '').slice(0, -1);
    const deleteLevel = await prisma.levels.delete({ where: { id } });
    const getListLevel = await prisma.levels.findMany({
      where: { rootId, item: { gt: deleteLevel.item } },
      orderBy: { id: 'asc' },
    });
    const newListLevel = getListLevel.map(async ({ id, item, name }, i) => {
      const rootItem = deleteLevel.item.split('.').slice(0, -1).join('-');
      const _deleteItem = deleteLevel.item.split('.').at(-1);
      const parseItem = (+(_deleteItem ? _deleteItem : 0) + i).toString();
      const newItem = (rootItem ? rootItem + '.' : '') + parseItem;
      const updateLevel = await prisma.levels.update({
        where: { id },
        data: { item: newItem },
      });
      const oldDir = dirLevel + parsePathLevel(item, name);
      const newDir =
        dirLevel + parsePathLevel(updateLevel.item, updateLevel.name);
      renameDir(oldDir, newDir);
      await this.updateByBlock(id, updateLevel.item);
    });
    const deleteDirLevel =
      dirLevel + parsePathLevel(deleteLevel.item, deleteLevel.name);
    const result = await Promise.all(newListLevel).then(() => deleteDirLevel);
    return result;
  }

  static async updateByBlock(rootId: Levels['rootId'], rootItem: string) {
    const findList = await prisma.levels.findMany({
      where: { rootId },
      select: { id: true, item: true, name: true, rootId: true },
    });
    if (findList.length === 0) return [];
    const newListTask = findList.map(async ({ id, item, ...data }) => {
      const getItem = item.split('.').at(-1);
      const newItem = (rootItem ? rootItem + '.' : '') + getItem;
      const oldDir = await PathLevelServices.pathLevel(id);
      const updateLevel = await prisma.levels.update({
        where: { id },
        data: { item: newItem },
      });
      const path = updateLevel.item + updateLevel.name;
      const newDir = setNewPath(oldDir, path);
      renameDir(oldDir, newDir);
      const nextLevel: typeof findList = await this.updateByBlock(id, newItem);
      if (nextLevel.length !== 0) {
        return { id, item, ...data, nextLevel };
      }
      return { id, item, ...data };
    });
    const result = await Promise.all(newListTask);
    return result;
  }

  static async findList(rootId: Levels['rootId'], percentage: number) {
    const findList = await prisma.levels.findMany({
      where: { rootId, subTasks: { every: { status: 'DONE' } } },
      include: {
        subTasks: {
          select: {
            id: true,
            name: true,
            item: true,
            description: true,
            price: true,
            status: true,
            users: {
              select: { percentage: true, user: Queries.selectProfileUser },
            },
          },
        },
      },
    });
    if (findList.length === 0) return [];
    const newListTask = findList.map(async ({ subTasks, ...level }) => {
      const nextLevel: typeof findList = await this.findList(
        level.id,
        percentage
      );
      const subtasks = percentageSubTasks(subTasks, percentage);
      const details = getDetailsSubtask(subTasks);
      const price = sumValues(subtasks, 'price');
      const spending = sumValues(subtasks, 'spending');
      const balance = price - spending;
      const newLevel = {
        ...level,
        spending,
        balance,
        price,
        details,
        subTasks: subtasks,
      };
      if (nextLevel.length !== 0) return { ...newLevel, nextLevel };
      return { ...newLevel };
    });
    const result = await Promise.all(newListTask);
    return result;
  }
}

export default LevelsServices;
