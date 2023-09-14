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
  existRootLevelPath,
  filterLevelList,
  getDetailsSubtask,
  getRootItem,
  getRootPath,
  parseRootItem,
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
    if (name.includes('projects'))
      throw new AppError('Error palabra reservada', 404);
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
    await existRootLevelPath(rootId, stagesId);
    const getDuplicate = await this.duplicate(rootId, stagesId, name, 'ROOT');
    const { duplicated, quantity } = getDuplicate;
    if (duplicated) throw new AppError('Error al crear, Nombre existente', 404);
    const root = await this.findRoot(rootId);
    const { rootItem, rootLevel, project, include } = root;
    const stages = { connect: { id: stagesId } };
    const isArea = project || include;
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
    //------------------------------------------------------------------------
    const { rootPath, ...level } = await getRootPath(id);
    const { rootId, stagesId, _item } = level;
    // const deleteLevel = await prisma.levels.delete({ where: { id } });
    const deleteLevel = await prisma.levels.findUnique({ where: { id } });
    if (!deleteLevel) throw new AppError('errpr', 404);
    if (!_item) return rootPath + parsePath(deleteLevel.item, deleteLevel.name);
    //------------------------------------------------------------------------
    const getList = await prisma.levels.findMany({
      where: {
        stagesId,
        level: { gt: level.rootLevel },
        item: { gt: _item },
      },
      orderBy: { item: 'asc' },
    });
    const { findList, list } = filterLevelList(
      getList,
      rootId,
      level.rootLevel
    );
    // //------------------------------------------------------------------------
    // const getList = await prisma.levels.findMany({
    //   where: { rootId, stagesId, item: { gt: _item } },
    //   orderBy: { id: 'asc' },
    // });
    const newListLevel = findList.map(async ({ id, item, name, level }, i) => {
      const newItem = parseRootItem(deleteLevel.item, i);
      await prisma.levels.update({ where: { id }, data: { item: newItem } });
      const oldDir = rootPath + parsePathLevel(item, name);
      const newDir = rootPath + parsePathLevel(newItem, name);
      renameDir(oldDir, newDir);
      await this.updateBlock(list, level, id, newDir, newItem);
      // await this.updateByBlock(id, updateLevel.item);
    });
    // //------------------------------------------------------------------------
    const { item, name } = deleteLevel;
    const deleteDir = rootPath + parsePath(item, name);
    const result = await Promise.all(newListLevel).then(() => deleteDir);
    return result;
  }

  static async updateBlock(
    _list: Levels[],
    _rootLevel: number,
    _rootId: number,
    rootPath: string,
    rootItem: string
  ) {
    const { findList, list } = filterLevelList(_list, _rootId, _rootLevel);
    if (findList.length === 0) return [];
    const newList = findList.map(async value => {
      const { level, id, item, name } = value;
      const { lastItem } = getRootItem(item);
      const newItem = (rootItem ? rootItem + '.' : '') + lastItem;
      const oldPath = rootPath + parsePath(item, name);
      const updateLevel = await prisma.levels.update({
        where: { id },
        data: { item: newItem },
      });
      const newPath = rootPath + parsePath(updateLevel.item, name);
      // const newPath = rootPath + parsePath(newItem, name);
      const path = newPath;
      renameDir(oldPath, newPath);
      const nextLevel: Levels[] = await this.updateBlock(
        list,
        level,
        id,
        path,
        newItem
      );
      if (nextLevel.length === 0) return { oldPath, newPath, ...value };
      return { oldPath, newPath, ...value, nextLevel };
    });
    const result = await Promise.all(newList);
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
