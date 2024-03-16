import { BasicFiles, BasicLevels, BasicTasks } from '@prisma/client';
import lodash from 'lodash';
import { numberToConvert } from '../utils/tools';
import {
  DuplicateLevel,
  FolderBasicLevelList,
  FolderLevels,
  GetFilterBasicLevels,
  GetFolderBasicLevels,
  MergePDFBasicFiles,
  ObjectNumber,
  TypeIdsList,
} from 'types/types';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  statSync,
  unlinkSync,
} from 'fs';
import GenerateFiles from '../utils/generateFile';

class BasicLevelServices {
  static async find(id: BasicLevels['id'], status?: BasicTasks['status']) {
    // const list = await this.mergePDFs(id, { status, typeFile: 'pdf' });
    const getBasicList = await prisma.basicLevels.findMany({
      where: { stagesId: id },
      orderBy: { index: 'asc' },
      include: {
        subTasks: {
          where: { status },
          include: {
            files: true,
          },
          orderBy: { index: 'asc' },
        },
      },
    });
    const list = this.findList(getBasicList, 0, 0, '');
    // const list = this.folderlist(
    //   getBasicList,
    //   {
    //     _item: '',
    //     _path: 'compress_cp/test',
    //     _rootId: 0,
    //     _rootLevel: 0,
    //   },
    //   true
    // );
    return list;
  }

  static async create({
    name,
    stagesId,
    rootId,
    userId,
    typeItem,
  }: BasicLevels) {
    //------------------------ Set new item ---------------------------
    const { quantity } = await this.duplicate(rootId, stagesId, name, 'ROOT');
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
    const updateLevel = await prisma.basicLevels.update({
      where: { id },
      data,
    });
    return updateLevel;
  }

  static async addToUpperorLower(
    id: BasicLevels['id'],
    { name, userId }: BasicLevels,
    typeGte: 'upper' | 'lower'
  ) {
    if (!id || !typeGte) throw new AppError('Oops!,ID invalido', 400);
    //--------------------------- Find level ------------------------------------
    const findLevel = await prisma.basicLevels.findUnique({ where: { id } });
    if (!findLevel)
      throw new AppError('No se pudieron encontrar el nivel', 404);
    const { index: _index, stagesId, rootId, level } = findLevel;
    const index = typeGte === 'upper' ? { gte: _index } : { gt: _index };
    //-----------------------------------------------------------------
    const filterLevelList = await prisma.basicLevels.groupBy({
      by: ['id', 'index'],
      where: { stagesId, rootId, level, index },
      orderBy: { index: 'asc' },
    });
    const filterData = lodash.omit(findLevel, ['id', 'name', 'userId']);
    const parseIndex = typeGte === 'upper' ? _index : _index + 1;
    const data = { ...filterData, name, userId: null, index: parseIndex };
    const newLevel = await prisma.basicLevels.create({ data });
    const updateLevels = await this.listByUpdate(filterLevelList, 1);
    return { newLevel, updateLevels };
  }

  static async delete(id: BasicLevels['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const findLevel = await prisma.basicLevels.findUnique({ where: { id } });
    if (!findLevel)
      throw new AppError('No se pudieron encontrar el nivel', 404);
    const filterLevelList = await prisma.basicLevels.groupBy({
      by: ['id', 'index'],
      where: {
        stagesId: findLevel.stagesId,
        rootId: findLevel.rootId,
        level: findLevel.level,
        index: { gt: findLevel.index },
      },
    });

    const dropList = await this.listByDelete(findLevel.id);
    const deleteList = dropList.flat(1) as number[];
    const deleteLevels = await prisma.basicLevels.deleteMany({
      where: { id: { in: deleteList } },
    });
    const updateLevels = await this.listByUpdate(filterLevelList);
    const deleteLevel = await prisma.basicLevels.delete({ where: { id } });
    return { deleteLevels, updateLevels, deleteLevel };
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
    const newList = findList.map(({ subTasks, ...value }) => {
      const findItem = numberToConvert(value.index, value.typeItem);
      const item = _item + (_item ? '.' : '') + findItem;
      let data;
      if (subTasks && subTasks.length) {
        const subtasks = subTasks.map(({ index, typeItem, ...value }) => {
          const findItem = numberToConvert(index, typeItem);
          const newItem = item + (item ? '.' : '') + findItem;
          return { item: newItem, index, typeItem, ...value };
        });
        data = { subTasks: subtasks };
      }
      const nextLevel: typeof findList = this.findList(
        list,
        value.id,
        value.level,
        item
      );
      if (!nextLevel.length) return { ...value, item, ...data };
      return { ...value, item, ...data, nextLevel };
    });
    return newList;
    // const nextLevel = this.findList(list,)
  }

  static folderlist(
    array: GetFolderBasicLevels[],
    {
      _rootId,
      _rootLevel,
      _item,
      _path,
    }: { _rootId: number; _rootLevel: number; _item: string; _path: string },
    createfiles: boolean = false
  ) {
    const findList = array.filter(
      ({ rootId, rootLevel }) => rootId === _rootId && rootLevel === _rootLevel
    );
    const list = array.filter(value => !findList.includes(value));
    if (!findList.length) return [];
    const newList = findList.map(
      ({ id, index, level, typeItem, name, subTasks }) => {
        const findItem = numberToConvert(index, typeItem);
        const item = _item + (_item ? '.' : '') + findItem;
        const newPath = item + '.' + name;
        const path = _path + '/' + newPath;
        if (createfiles && !existsSync(path))
          mkdirSync(path, { recursive: true });
        const subtasks = subTasks?.map(
          ({ index, name, typeItem, id, files: _files }) => {
            const findItem = numberToConvert(index, typeItem);
            const newItem = item + (item ? '.' : '') + findItem;
            const newName = newItem + '.' + name;
            const _path = path + '/' + newName;
            //------------------------- Count files per task ------------------------------------------
            const countExt =
              _files?.reduce((acc: ObjectNumber, value) => {
                const ext = value.name.split('.').at(-1) || '';
                acc[ext] = (acc[ext] || 0) + 1;
                return acc;
              }, {}) || {};
            //-------------------------------------------------------------------
            const files =
              _files?.map(({ dir, name: nameFile, id, type }) => {
                const oldPath = dir + '/' + nameFile;
                if (type === 'UPLOADS') {
                  const ext = nameFile.split('.').at(-1) || '';
                  countExt[ext] -= 1;
                  const pivot = countExt[ext] >= 1 ? ` (${countExt[ext]})` : '';
                  const newFileName = newName + pivot + '.' + ext;
                  const newPath = path + '/' + newFileName;
                  return { id, oldPath, newPath };
                }
                const newPath = path + '/' + nameFile;
                return { id, oldPath, newPath };
              }) || [];
            if (createfiles)
              files.forEach(({ newPath, oldPath }) =>
                copyFileSync(oldPath, newPath)
              );
            return { id, index, name: newName, path: _path, files };
          }
        );
        const next: FolderLevels[] = this.folderlist(list, {
          _rootId: id,
          _rootLevel: level,
          _item: item,
          _path: path,
        });
        const data = { id, index, path, subtasks };
        if (!next.length) return data;
        return { ...data, next };
      }
    );
    return newList;
  }

  static async listByUpdate(
    list: { id: number; index: number }[],
    quantity: number = -1
  ) {
    const updateListPerLevel = await Promise.all(
      list.map(async ({ id, index }) => {
        const data = { index: index + quantity };
        const update = await prisma.basicLevels.update({ where: { id }, data });
        return update.id;
      })
    );
    return updateListPerLevel;
  }

  // static valueBasic: FolderBasicLevelList[] = JSON.parse(
  //   readFileSync('compress_cp/values_basic.json', 'utf-8')
  // );

  static async mergePDFs(
    id: BasicLevels['id'],
    { status, typeFile = 'all' }: MergePDFBasicFiles
  ) {
    const filterFiles = (typeFile: MergePDFBasicFiles['typeFile']) => {
      const type = { type: 'UPLOADS' as BasicFiles['type'] };
      if (typeFile === 'no_pdf')
        return { ...type, NOT: { name: { endsWith: '.pdf' } } };
      if (typeFile === 'pdf') return { ...type, name: { endsWith: '.pdf' } };
      return {};
    };
    const getBasicList = await prisma.basicLevels.findMany({
      where: { stagesId: id },
      orderBy: { index: 'asc' },
      include: {
        subTasks: {
          where: { status },
          include: { files: { where: filterFiles(typeFile) } },
          orderBy: { index: 'asc' },
        },
      },
    });
    const list = this.folderlist(getBasicList, {
      _rootId: 0,
      _rootLevel: 0,
      _item: '',
      _path: 'compress_cp/basic',
    });

    const parseFiles = list.map(file => file as FolderBasicLevelList);
    if (typeFile === 'pdf') {
      mkdirSync('compress_cp/filemerge', { recursive: true });
      await this.parsingPathMerge(parseFiles);
      const patito2 = readdirSync('compress_cp/filemerge');
      const patito3 = patito2.map(value => 'compress_cp/filemerge/' + value);
      console.log(patito3);
      await GenerateFiles.merge(patito3, 'compress_cp/mergetask.pdf');
      // const sizeMerge = statSync('compress_cp/mergetask.pdf').size;
      // console.log(sizeMerge);
      setTimeout(() => {
        rmSync('compress_cp/filemerge', { recursive: true });
      }, 4000);
    }

    return this.listFilter;
  }

  static listFilter: { name: string; files: string[] }[] = [];

  static async parsingPathMerge(list: FolderBasicLevelList[]) {
    list?.forEach(async ({ subtasks, next }) => {
      if (subtasks && subtasks.length) {
        subtasks.forEach(async value => {
          const files = value.files.map(({ oldPath }) => oldPath);
          const outputPath = 'compress_cp/filemerge/' + value.name + '.pdf';
          if (files.length) {
            await GenerateFiles.merge(files, outputPath);
          }
        });
      }
      await this.parsingPathMerge(next);
    });
  }

  static async listByDelete(rootId: BasicLevels['rootId']) {
    if (!rootId) throw new AppError('Oops!, ID invalido', 400);
    const findIds = await prisma.basicLevels.groupBy({
      by: ['id', 'index'],
      where: { rootId },
      orderBy: { index: 'asc' },
    });
    const list: TypeIdsList[] = await Promise.all(
      findIds.map(async ({ id }) => {
        const next = await this.listByDelete(id);
        if (!next.length) return id;
        return [id, ...next].flat(1);
      })
    );
    return list;
  }

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
}

export default BasicLevelServices;
