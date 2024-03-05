import { BasicLevels, SubTasks } from '@prisma/client';
import { numberToConvert } from '../utils/tools';
import {
  DuplicateLevel,
  FolderLevels,
  GetFilterBasicLevels,
  ListCostType,
  TypeIdsList,
} from 'types/types';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { existsSync, mkdirSync } from 'fs';

class BasicLevelServices {
  static async findRoot(id: number) {
    const root = await prisma.basicLevels.findUnique({ where: { id } });
    return {
      stagesId: root ? root.stagesId : 0,
      rootLevel: root ? root.level : 0,
      project: root ? root.isProject : false,
      area: root ? root.isArea : false,
      include: root ? root.isInclude : false,
      typeIndex: root ? root.typeItem : null,
    };
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
    if (name.includes('_basic'))
      throw new AppError('Error palabra reservada', 404);
    if (type === 'ID') {
      const getLevel = await prisma.basicLevels.findUnique({ where: { id } });
      if (!getLevel) throw new AppError('No se pudo encontrar el índice', 404);
      rootId = getLevel.rootId;
      stagesId = getLevel.stagesId;
    }
    const list = await prisma.basicLevels.groupBy({
      by: ['id', 'name'],
      where: { rootId, stagesId },
    });
    const duplicated = list.some(l => l.name.includes(name));
    return { duplicated, rootId, quantity: list.length };
  }

  static async find(id: BasicLevels['id']) {
    const getBasicList = await prisma.basicLevels.findMany({
      where: { stagesId: id },
      orderBy: { index: 'asc' },
      select: {
        id: true,
        index: true,
        typeItem: true,
        name: true,
        rootId: true,
        level: true,
        rootLevel: true,
      },
    });
    const list = this.findList(getBasicList, 0, 0, '');
    return list;
  }

  static findList(
    array: GetFilterBasicLevels[],
    _rootId: number,
    _rootLevel: number,
    _item: string
    // listCost?: ListCostType
  ) {
    const findList = array.filter(
      ({ rootId, rootLevel }) => rootId === _rootId && rootLevel === _rootLevel
    );
    const list = array.filter(value => !findList.includes(value));
    if (!findList.length) return [];
    const newList = findList.map(({ ...value }) => {
      const findItem = numberToConvert(value.index, value.typeItem);
      const item = _item + (_item ? '.' : '') + findItem;
      const nextLevel: typeof findList = this.findList(
        list,
        value.id,
        value.level,
        item
      );
      if (!nextLevel.length) return { ...value, item };
      return { ...value, item, nextLevel };
    });
    return newList;
    // const nextLevel = this.findList(list,)
  }

  static folderlist(
    array: GetFilterBasicLevels[],
    _rootId: number,
    _rootLevel: number,
    _item: string,
    _path: string
  ) {
    const findList = array.filter(
      ({ rootId, rootLevel }) => rootId === _rootId && rootLevel === _rootLevel
    );
    const list = array.filter(value => !findList.includes(value));
    if (!findList.length) return [];
    const newList = findList.map(({ id, index, level, typeItem, name }) => {
      const findItem = numberToConvert(index, typeItem);
      const item = _item + (_item ? '.' : '') + findItem;
      const newPath = item + '.' + name;
      const path = _path + '/' + newPath;
      // if (!existsSync(path)) mkdirSync(path, { recursive: true });
      const next: FolderLevels[] = this.folderlist(list, id, level, item, path);
      const data = { id, index, path };
      if (!next.length) return data;
      return { ...data, next };
    });
    return newList;
  }

  static async create({
    name,
    stagesId,
    rootId,
    userId,
    typeItem,
  }: BasicLevels) {
    //------------------------ Set new item ---------------------------
    const { duplicated, quantity } = await this.duplicate(
      rootId,
      stagesId,
      name,
      'ROOT'
    );
    const index = quantity + 1;
    const { rootLevel } = await this.findRoot(rootId);
    // const { ootItem, rootLevel, project, include, area } = root;
    const stages = { connect: { id: stagesId } };
    const level = rootLevel + 1;
    const _values = {
      rootId,
      name,
      index,
      rootLevel,
      stages,
      level,
      typeItem,
    };
    const newLevel = await prisma.basicLevels.create({ data: _values });
    return newLevel;
  }

  static async update(
    id: BasicLevels['id'],
    { name, userId = null }: BasicLevels
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const { duplicated } = await this.duplicate(id, 0, name, 'ID');
    if (duplicated) throw new AppError('Error al crear, Nombre existente', 404);
    const data = !duplicated ? { name } : userId ? { userId } : {};
    const updateLevel = await prisma.levels.update({ where: { id }, data });
    return updateLevel;
  }

  static async delete(id: BasicLevels['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const findLevel = await prisma.basicLevels.findUnique({ where: { id } });
    if (!findLevel)
      throw new AppError('No se pudieron encontrar el nivel', 404);
    const filterLevelList = await prisma.basicLevels.groupBy({
      by: ['id', 'name', 'index'],
      where: {
        stagesId: findLevel.stagesId,
        rootId: findLevel.rootId,
        level: findLevel.level,
        index: { gt: findLevel.index },
      },
    });

    const deleteList = (await this.deleteBlock(findLevel.id)).flat(
      1
    ) as number[];
    const deleteLevels = await prisma.basicLevels.deleteMany({
      where: { id: { in: deleteList } },
    });
    const updateListPerLevel = await Promise.all(
      filterLevelList.map(async ({ id, index }) => {
        const data = { index: index - 1 };
        const update = await prisma.basicLevels.update({ where: { id }, data });
        return update.id;
      })
    );
    const deleteLevel = await prisma.basicLevels.delete({ where: { id } });
    return { deleteLevels, updateListPerLevel, deleteLevel };
  }

  static async deleteBlock(rootId: BasicLevels['rootId']) {
    if (!rootId) throw new AppError('Oops!, ID invalido', 400);
    const findIds = await prisma.basicLevels.groupBy({
      by: ['id', 'index'],
      where: { rootId },
      orderBy: { index: 'asc' },
    });
    const list: TypeIdsList[] = await Promise.all(
      findIds.map(async ({ id }) => {
        const next = await this.deleteBlock(id);
        if (!next.length) return id;
        return [id, ...next].flat(1);
      })
    );
    return list;
  }
}

export default BasicLevelServices;
