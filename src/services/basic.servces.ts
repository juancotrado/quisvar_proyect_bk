/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Levels, Stages, SubTasks } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { parsePath, renameDir } from '../utils/fileSystem';
import {
  existRootLevelPath,
  filterLevelList,
  getRootItem,
  getRootPath,
  numberToConvert,
  percentageSubTasks,
  roundTwoDecimail,
  sumValues,
} from '../utils/tools';
import {
  DuplicateLevel,
  GetFilterLevels,
  ListCostType,
  UpdateLevelBlock,
} from 'types/types';
import { existsSync, renameSync } from 'fs';
import Queries from '../utils/queries';
import PathServices from './paths.services';

class BasicServices {
  static async find(id: Levels['id'], status?: SubTasks['status']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const findRootLevel = await prisma.levels.findUnique({ where: { id } });
    if (!findRootLevel) throw new AppError('No se pudó encontrar nivel', 400);
    const { stagesId, level } = findRootLevel;
    const getList = await prisma.levels.findMany({
      where: {
        stagesId,
        level: { gt: level },
      },
      orderBy: { index: 'asc' },
      include: {
        subTasks: {
          where: { status },
          orderBy: { index: 'asc' },
          include: {
            users: {
              select: {
                percentage: true,
                userId: true,
                user: Queries.selectProfileUser,
              },
            },
          },
        },
      },
    });
    const nextLevel = this.findList(getList, id, level);
    return { ...findRootLevel, nextLevel };
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
      rootItem: root ? root.item.slice(0, -1) : null,
      stagesId: root ? root.stagesId : 0,
      rootLevel: root ? root.level : 0,
      project: root ? root.isProject : false,
      area: root ? root.isArea : false,
      include: root ? root.isInclude : false,
      typeIndex: root ? root.typeItem : null,
    };
  }
  static async create({
    name,
    stagesId,
    rootId,
    isProject,
    userId,
    isArea,
    typeItem,
  }: Levels) {
    //---------------------------exist_file----------------------------------------
    await existRootLevelPath(rootId, stagesId);
    //--------------------duplicate_name_level-------------------------------------
    const getDuplicate = await this.duplicate(rootId, stagesId, name, 'ROOT');
    const { duplicated, quantity } = getDuplicate;
    if (duplicated) throw new AppError('Error al crear, Nombre existente', 404);
    //--------------------------get_new_item---------------------------------------
    const root = await this.findRoot(rootId);
    const { rootItem, rootLevel, project, include, area } = root;
    const stages = { connect: { id: stagesId } };
    // const isArea = area;
    const level = rootLevel + 1;
    const isInclude = area || include;
    //--------------------------set_new_item---------------------------------------
    const index = quantity + 1;
    const newRootItem = rootItem ? rootItem + '.' : '';
    const _type = numberToConvert(index, typeItem);
    if (!_type) throw new AppError('excediste Limite de conversion', 400);
    const item = `${newRootItem}${_type}.`;
    //--------------------------find_user------------------------------------------
    const _user = () => {
      if (userId && (project || isProject || isArea))
        return { connect: { id: userId } };
      return undefined;
    };
    //-----------------------------------------------------------------------------
    const _values = {
      rootId,
      item,
      name,
      index,
      rootLevel,
      stages,
      level,
      typeItem,
    };
    const data = { ..._values, isProject, isArea, isInclude, user: _user() };
    const newLevel = await prisma.levels.create({ data });

    return newLevel;
  }

  static async update(id: Levels['id'], { name, userId = null }: Levels) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const oldPath = await PathServices.level(id);
    if (!existsSync(oldPath)) throw new AppError('Ops!,carpeta no existe', 404);
    const { duplicated } = await this.duplicate(id, 0, name, 'ID');
    let updateLevel;
    if (!duplicated) {
      updateLevel = await prisma.levels.update({
        where: { id },
        data: { name },
      });
    }
    if (userId) {
      updateLevel = await prisma.levels.update({
        where: { id },
        data: { userId },
      });
    }
    return { ...updateLevel, oldPath };
  }

  static async updateTypeItem(
    id: Levels['id'],
    rootTypeItem: Levels['rootTypeItem'],
    isArea: Stages['isProject'],
    type: 'LEVEL' | 'STAGE' = 'LEVEL'
  ) {
    if (type === 'STAGE') {
      const stageType = await prisma.stages.update({
        where: { id },
        data: { rootTypeItem, isProject: isArea },
      });
      return stageType;
    }
    const levelType = await prisma.levels.update({
      where: { id },
      data: { rootTypeItem, isProject: isArea },
    });
    return levelType;
  }

  static async delete(id: Levels['id']) {
    //----------------------------verify_exist------------------------------------
    const getInfoLevel = await getRootPath(id);
    const { rootPath, rootId, stagesId, _item, rootLevel } = getInfoLevel;
    //----------------------------verify_tasks------------------------------------
    const _count = await this.verifyTasks(stagesId, _item, getInfoLevel.level);
    if (_count) throw new AppError('Error al eliminar, contiene tareas', 400);
    //----------------------------delete_level------------------------------------
    const deleteLevel = await prisma.levels.delete({ where: { id } });
    const deleteDir = rootPath + parsePath(_item, deleteLevel.name);
    await this.verifyTasks(stagesId, deleteLevel.item, deleteLevel.level);
    const getList = await prisma.levels.findMany({
      where: {
        stagesId,
        level: { gt: rootLevel },
        item: { gt: _item, not: { startsWith: _item } },
      },
      include: {
        subTasks: {
          select: {
            index: true,
            id: true,
            item: true,
            typeItem: true,
            files: {
              where: { OR: [{ type: 'UPLOADS' }, { type: 'EDITABLES' }] },
              select: { id: true, dir: true, name: true, type: true },
            },
          },
        },
      },
      orderBy: { item: 'asc' },
    });
    // //-----------------------update_some_levels----------------------------------
    const { rootItem } = getRootItem(_item);
    const _rootItem = rootItem ? rootItem + '.' : rootItem;
    const updateList = await this.updateBlock(
      getList,
      rootLevel,
      rootId,
      rootPath,
      _rootItem,
      getInfoLevel.index
    );
    // //-------------------------return_delete_dir---------------------------------
    const result = await Promise.all(updateList).then(() => {
      // deleteList();
      return deleteDir;
    });
    return result;
  }

  static async deleteBlock(stagesId: number, item: string, level: number) {
    const deleteList = await prisma.levels.groupBy({
      by: ['id'],
      where: {
        stagesId,
        item: { startsWith: item },
        level: { gt: level },
      },
    });
    const levelListDelete = deleteList.map(({ id }) => id);
    await prisma.levels.deleteMany({
      where: { id: { in: levelListDelete } },
    });
    return levelListDelete;
  }

  static async verifyTasks(stagesId: number, item: string, level: number) {
    const list = await prisma.subTasks.groupBy({
      by: ['id'],
      where: {
        Levels: {
          stagesId,
          item: { startsWith: item },
          level: { gt: level },
        },
        NOT: { status: 'UNRESOLVED' },
      },
    });
    const verify = !!list.length;
    return verify;
  }

  static updateBlock(
    _list: UpdateLevelBlock[],
    _rootLevel: number,
    _rootId: number,
    rootPath: string,
    rootItem: string,
    previusIndex?: number
  ) {
    const { findList, list } = filterLevelList(_list, _rootId, _rootLevel);
    if (findList.length === 0) return [];
    const newList = findList.map(
      async ({ subTasks: subtasks, ...value }, i) => {
        const { level, id, item, name } = value;
        //-----------------------------get_new_item--------------------------------------
        const { lastItem } = getRootItem(item);
        let index = value.index;
        let _item = rootItem + lastItem + '.';
        if (previusIndex) {
          index = previusIndex + i;
          const _type = numberToConvert(index, value.typeItem) || '';
          _item = rootItem + _type + '.';
        }
        //----------------------------update_level---------------------------------------
        const updateLevel = await prisma.levels.update({
          where: { id },
          data: { item: _item, index },
        });
        //------------------------------get_paths---------------------------------------
        const oldPath = rootPath + parsePath(item, name);
        const newPath = rootPath + parsePath(updateLevel.item, name);
        const oldEditable = oldPath.replace('projects', 'editables');
        const newEditable = newPath.replace('projects', 'editables');
        renameDir(oldPath, newPath);
        renameDir(oldEditable, newEditable);
        //-------------------------------------------------------------------------------
        const subTasks = await Promise.all(
          subtasks.map(async ({ item: _item, files: _files, ...subtask }) => {
            const { lastItem } = getRootItem(_item);
            const item = updateLevel.item + lastItem + '.';
            const updateSubtask = await prisma.subTasks.update({
              where: { id: subtask.id },
              data: { item },
            });
            //-------------------------------------------------------------------------------
            const parseFiles = await Promise.all(
              _files.map(async ({ dir: d, id: _id, name: n, ...file }, i) => {
                const { item: _i, name: _n } = updateSubtask;
                // const dir = file.type === 'UPLOADS' ? newPath : newEditable;
                const dir = newPath;
                const ext = `.${n.split('.').at(-1)}`;
                const name = _i + _n + `_${i + 1}${ext}`;
                await prisma.files
                  .update({
                    where: { id: _id },
                    data: { dir, name },
                  })
                  .then(() => {
                    if (['.pdf', '.PDF'].includes(ext) && newEditable) {
                      renameSync(
                        `${newEditable}/${n}`,
                        `${newEditable}/${name}`
                      );
                    }
                    renameSync(`${newPath}/${n}`, `${newPath}/${name}`);
                  });
                return { dir, name, ...file };
              })
            );
            //-------------------------------------------------------------------------------
            const files = parseFiles.map(f => ({ id: 0, ...f }));
            return { item, files, ...subtask };
          })
        );
        const nextLevel: UpdateLevelBlock[] = await this.updateBlock(
          list,
          level,
          id,
          newPath,
          _item
        );
        if (!nextLevel.length) return { oldPath, newPath, subTasks, ...value };
        return { oldPath, newPath, ...value, subTasks, nextLevel };
      }
    );
    const result = Promise.all(newList);
    return result;
  }

  static findList(
    array: GetFilterLevels[],
    _rootId: number,
    _rootLevel: number,
    listCost?: ListCostType
  ) {
    const findList = array.filter(
      ({ rootId, rootLevel }) => rootId === _rootId && rootLevel === _rootLevel
    );
    const list = array.filter(value => !findList.includes(value));
    if (!findList.length) return [];
    const newList = findList.map(({ subTasks, ...value }) => {
      const { id, level } = value;
      let data: any = {
        spending: 0,
        balance: 0,
        price: 0,
        days: 0,
        listUsers: [],
        percentage: 0,
        total: 0,
        ...value,
      };
      if (subTasks && subTasks.length) {
        const subtasks = percentageSubTasks(subTasks, listCost);
        const price = sumValues(subtasks, 'price');
        const days = sumValues(subtasks, 'days');
        const spending = sumValues(subtasks, 'spending');
        const percentage = sumValues(subtasks, 'percentage') / subTasks.length;
        //---------------------------------------------------------------------
        const list = subtasks.map(({ listUsers }) => listUsers).flat(2);
        const listUsers = list.reduce(
          (acc: typeof list, { count, userId, ...data }) => {
            const exist = acc.findIndex(u => u.userId === userId);
            exist > 0
              ? (acc[exist].count += count)
              : acc.push({ userId, count, ...data });
            return acc;
          },
          []
        );
        //---------------------------------------------------------------------
        const total = subTasks.length;
        const balance = roundTwoDecimail(price - spending);
        data = {
          price,
          spending,
          balance,
          days,
          percentage,
          listUsers,
          total,
          ...value,
          subTasks: subtasks,
        };
      }
      const nextLevel: typeof findList = this.findList(
        list,
        id,
        level,
        listCost
      );
      if (!nextLevel.length) return data;
      return { ...data, nextLevel };
    });
    return newList;
  }
}

export default BasicServices;
