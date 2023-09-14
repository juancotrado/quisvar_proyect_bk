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
  getRootItem,
  getRootPath,
  percentageSubTasks,
  sumValues,
} from '../utils/tools';
import { DuplicateLevel } from 'types/types';
import { existsSync } from 'fs';

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

  static async duplicate(
    id: number,
    stageId: number,
    name: string,
    type: DuplicateLevel['type']
  ) {
    let rootId, stagesId;
    rootId = id;
    stagesId = stageId;
    if (type === 'ID') {
      const getId = await prisma.levels.findUnique({ where: { id } });
      if (!getId) throw new AppError('No se pudo encontrar el índice', 404);
      rootId = getId.rootId;
      stagesId = getId.stagesId;
    }
    const list = await prisma.levels.findMany({ where: { rootId, stagesId } });
    if (!list) throw new AppError('No se pudo encontrar la lista', 404);
    const duplicated = list.map(({ name }) => name).includes(name);
    const quantity = list.length;
    return { duplicated, quantity, rootId };
  }

  static async findRoot(rootId: number) {
    const root = await prisma.levels.findUnique({ where: { id: rootId } });
    return {
      rootItem: root ? root.item : null,
      stagesId: root ? root.stagesId : 0,
      rootLevel: root ? root.level : 0,
      project: root ? root.isProject : false,
      area: root ? root.isArea : false,
      include: root ? root.isInclude : false,
    };
  }

  static async create({ name, stagesId, rootId, isProject, userId }: Levels) {
    const getDuplicate = await this.duplicate(rootId, stagesId, name, 'ROOT');
    const { duplicated, quantity } = getDuplicate;
    if (duplicated) throw new AppError('Error al crear, Nombre existente', 404);
    const root = await this.findRoot(rootId);
    const { rootItem, rootLevel, project, include } = root;
    const stages = { connect: { id: stagesId } };
    const isArea = project;
    const level = rootLevel + 1;
    const isInclude = project || include;
    const newRootItem = rootItem ? rootItem + '.' : '';
    const item = isInclude ? newRootItem + `${quantity + 1}` : '';
    const user = userId && project ? { connect: { id: userId } } : undefined;
    const _values = { rootId, item, name, rootLevel, stages, level };
    const data = { ..._values, isProject, isArea, isInclude, user };
    const newLevel = await prisma.levels.create({ data });
    return newLevel;
  }

  static async update(id: Levels['id'], { name }: Levels) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const oldPath = await PathLevelServices.pathLevel(id);
    if (!existsSync(oldPath)) throw new AppError('Ops!,carpeta no existe', 404);
    const { duplicated } = await this.duplicate(id, 0, name, 'ID');
    if (duplicated) throw new AppError('Error al crear, Nombre existente', 404);
    const updateLevel = await prisma.levels.update({
      where: { id },
      data: { name },
    });
    return { ...updateLevel, oldPath };
  }

  static async delete(id: Levels['id']) {
    const { rootPath, ...level } = await getRootPath(id);
    const { rootId, stagesId, _item } = level;
    const deleteLevel = await prisma.levels.findUnique({ where: { id } });
    // const deleteLevel = await prisma.levels.delete({ where: { id } });
    if (!deleteLevel)
      throw new AppError('No se pudieron encontrar el nivel', 404); //delete
    if (!_item) return rootPath + parsePath(deleteLevel.item, deleteLevel.name);
    const getList = await prisma.levels.findMany({
      where: { rootId, stagesId },
      orderBy: { id: 'asc' },
    });
    //########################################################
    const newListLevel = getList.map(async ({ id, item, name }, i) => {
      const { rootItem, lastItem } = getRootItem(deleteLevel.item);
      // const parseItem = (+(_deleteItem ? _deleteItem : 0) + i).toString();
      // const newItem = (rootItem ? rootItem + '.' : '') + parseItem;
      // const updateLevel = await prisma.levels.update({
      //   where: { id },
      //   data: { item: newItem },
      // });
      // const oldDir = dirLevel + parsePathLevel(item, name);
      // const newDir =
      //   dirLevel + parsePathLevel(updateLevel.item, updateLevel.name);
      // renameDir(oldDir, newDir);
      //######################################################
      // await this.updateByBlock(id, updateLevel.item);
    });
    // const deleteDirLevel =
    //   dirLevel + parsePathLevel(deleteLevel.item, deleteLevel.name);
    // const result = await Promise.all(newListLevel).then(() => deleteDirLevel);
    return getList;
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
      where: { rootId },
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
