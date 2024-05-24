/* eslint-disable @typescript-eslint/no-explicit-any */
import { BasicFiles, BasicLevels, BasicTasks } from '@prisma/client';
import lodash from 'lodash';
import {
  dataWithLevel,
  numberToConvert,
  percentageBasicTasks,
} from '../utils/tools';
import {
  DuplicateLevel,
  FolderBasicLevelList,
  FolderLevels,
  GeneratePathAtributtes,
  GetFilterBasicLevels,
  GetFolderBasicLevels,
  ListCostType,
  MergeLevels,
  MergePDFBasicFiles,
  ObjectNumber,
  OptionsBasicFilters,
  OptionsMergePdfs,
  TypeIdsList,
} from 'types/types';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { copyFileSync, mkdirSync } from 'fs';
import GenerateFiles from '../utils/generateFile';
import Queries from '../utils/queries';

class BasicLevelServices {
  public static async getList(
    id: BasicLevels['id'],
    typeId: 'stage' | 'level' = 'level',
    {
      status,
      type,
      equal,
      endsWith,
      includeFiles = false,
      includeUsers = true,
    }: OptionsBasicFilters
  ) {
    if (!id) throw new AppError('Opps, ID invalido', 400);
    //---------------------------- filter_items ------------------------------
    const name = equal ? { endsWith } : { not: { endsWith } };
    const files = includeFiles ? { files: { where: { type, name } } } : {};
    const users = includeUsers
      ? {
          users: {
            select: {
              userId: true,
              percentage: true,
              user: Queries.selectProfileUser,
            },
          },
        }
      : {};
    //------------------------------------------------------------------------
    let findStage = null;
    if (typeId === 'level') {
      findStage = await prisma.basicLevels.findUnique({
        where: { id },
        include: {
          subTasks: {
            where: { status },
            orderBy: { index: 'asc' },
            include: {
              ...files,
              ...users,
            },
          },
        },
      });
    }
    if (typeId === 'level' && !findStage)
      throw new AppError('Opps, nivel inexistente', 400);
    //---------------------------- filter_items ------------------------------
    const level = findStage ? { gt: findStage.level } : {};
    const stagesId = typeId === 'level' ? findStage?.stagesId : id;
    //------------------------------------------------------------------------
    const getBasicList = await prisma.basicLevels.findMany({
      where: { stagesId, level },
      orderBy: { index: 'asc' },
      include: {
        subTasks: {
          where: { status },
          include: { ...files, ...users },
          orderBy: { index: 'asc' },
        },
      },
    });
    const aux: typeof getBasicList = findStage ? [findStage] : [];
    const info = {
      rootId: findStage?.rootId ?? 0,
      rootLevel: findStage?.rootLevel ?? 0,
    };
    return { info, data: [...aux, ...getBasicList] };
  }

  public static async find(
    id: BasicLevels['id'],
    status?: BasicTasks['status']
  ) {
    const getBasicList = await this.getList(id, 'level', { status });
    const { rootId, rootLevel } = getBasicList.info;
    const list = this.findList(getBasicList.data, rootId, rootLevel, '');
    return list;
  }

  public static async create({
    name,
    stagesId,
    rootId,
    // userId,
    typeItem,
  }: BasicLevels) {
    //------------------------ Set new item ---------------------------
    const { quantity } = await this.duplicate(rootId, stagesId, name, 'ROOT');
    const index = quantity + 1;
    const { rootLevel, levelList: list } = await this.findRoot(rootId);
    const stages = { connect: { id: stagesId } };
    const level = rootLevel + 1;
    const levelList = [...(list ? list : []), rootId];
    const _values = {
      rootId,
      name,
      index,
      rootLevel,
      stages,
      level,
      typeItem,
      levelList,
    };
    const newLevel = await prisma.basicLevels.create({ data: _values });
    return newLevel;
  }

  public static async update(
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

  public static async delete(id: BasicLevels['id']) {
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

  public static async addToUpperorLower(
    id: BasicLevels['id'],
    {
      name,
    }: // userId
    BasicLevels,
    typeGte: 'upper' | 'lower'
  ) {
    if (!id || !typeGte) throw new AppError('Oops!,ID invalido', 400);
    //--------------------------- Find level ------------------------------------
    const findLevel = await prisma.basicLevels.findUnique({ where: { id } });
    if (!findLevel)
      throw new AppError('No se pudieron encontrar el nivel', 404);
    const { index: _index, stagesId, rootId, level, levelList } = findLevel;
    const index = typeGte === 'upper' ? { gte: _index } : { gt: _index };
    //-----------------------------------------------------------------
    const filterLevelList = await prisma.basicLevels.groupBy({
      by: ['id', 'index'],
      where: { stagesId, rootId, level, index },
      orderBy: { index: 'asc' },
    });
    const filterData = lodash.omit(findLevel, ['id', 'name', 'userId']);
    const parseIndex = typeGte === 'upper' ? _index : _index + 1;
    const aux = { ...filterData, userId: null, index: parseIndex };
    const data = { ...aux, name, levelList };
    const newLevel = await prisma.basicLevels.create({ data });
    const updateLevels = await this.listByUpdate(filterLevelList, 1);
    return { newLevel, updateLevels };
  }

  public static async addCoverList(
    levels: { id: BasicLevels['id']; cover: boolean }[]
  ) {
    const updateList = levels.map(({ id, cover }) => {
      return prisma.basicLevels.update({ where: { id }, data: { cover } });
    });
    return await prisma.$transaction(updateList);
  }

  public static async updateDaysPerId(
    levels: { id: BasicLevels['id']; days: number }[]
  ) {
    const updateList = levels.map(({ id, days }) => {
      return prisma.basicTasks.update({ where: { id }, data: { days } });
    });
    return await prisma.$transaction(updateList);
  }

  public static findList(
    array: GetFilterBasicLevels[],
    _rootId: number,
    _rootLevel: number,
    _item: string,
    listCost?: ListCostType
  ) {
    const findList = array.filter(
      ({ rootId, rootLevel }) => rootId === _rootId && rootLevel === _rootLevel
    );
    const list = array.filter(value => !findList.includes(value));
    if (!findList.length) return [];
    const newList = findList.map(({ subTasks, ...value }) => {
      //-----------------------------------------------------------
      const findItem = numberToConvert(value.index, value.typeItem);
      const item = _item + (_item ? '.' : '') + findItem;
      //-----------------------------------------------------------
      let data: any = { item, ...dataWithLevel, ...value };
      if (subTasks && subTasks.length) {
        const { subTasks: subtasks, ...info } = percentageBasicTasks(
          subTasks,
          item,
          listCost
        );
        data = { item, ...value, ...info, subTasks: subtasks };
      }
      const nextLevel: typeof findList = this.findList(
        list,
        value.id,
        value.level,
        item,
        listCost
      );
      if (!nextLevel.length) return data;
      return { ...data, nextLevel };
    });
    return newList;
  }

  public static async folderlist(
    array: GetFolderBasicLevels[],
    {
      rootId: _rootId,
      rootLevel: _rootLevel,
      item: _item,
      path: _path,
    }: GeneratePathAtributtes,
    createFiles: boolean
  ) {
    const findList = array.filter(
      ({ rootId, rootLevel }) => rootId === _rootId && rootLevel === _rootLevel
    );
    const list = array.filter(value => !findList.includes(value));
    if (!findList.length) return [];
    const newList = findList.map(
      async ({ subTasks, id: rootId, level: rootLevel, ...values }) => {
        const { item, path, name } = this.getItemAndPath(_item, _path, values);
        //--------------------------------------------------------------
        const subtaskPromise = subTasks.map(async task => {
          const {
            name,
            item: i,
            path: taskPath,
          } = this.getItemAndPath(item, path, task);
          const files = this.getRenameFiles(task.files, path, name, i);
          if (createFiles) {
            await new Promise(resolve => {
              mkdirSync(path, { recursive: true });
              files.forEach(file => {
                copyFileSync(file.oldPath, file.newPath);
              });
              resolve(path);
            });
          }
          return {
            id: task.id,
            index: task.index,
            name,
            path: taskPath,
            files,
          };
        });
        const subtasks = await Promise.all(subtaskPromise);
        if (createFiles && !subTasks.length)
          await new Promise(resolve => {
            mkdirSync(path, { recursive: true });
            resolve(path);
          });
        const nextLevel = {
          rootId,
          rootLevel,
          item: item,
          path: path,
        };
        const next: FolderLevels[] = await this.folderlist(
          list,
          nextLevel,
          createFiles
        );
        const data = { id: rootId, index: values.index, name, path, subtasks };
        if (!next.length) return data;
        return { ...data, next };
      }
    );
    return await Promise.all(newList);
  }

  public static async mergePDFList(
    array: GetFolderBasicLevels[],
    outputPath: string,
    atributtes: GeneratePathAtributtes,
    { createFiles, createCover }: OptionsMergePdfs
  ) {
    const { rootId: _rootId, rootLevel: _rootLevel } = atributtes;
    const { item: _item, path: _path } = atributtes;
    //------------------------------------------------------------------------------------
    const findList = array.filter(
      ({ rootId, rootLevel }) => rootId === _rootId && rootLevel === _rootLevel
    );
    const list = array.filter(value => !findList.includes(value));
    if (!findList.length) return [];
    const newList = findList.map(
      async ({ subTasks, id: rootId, level: rootLevel, cover, ...values }) => {
        //------------------------- item_definition -------------------------------------
        const { item, path, name } = this.getItemAndPath(
          _item,
          _path,
          values,
          cover
        );
        const getFiles = subTasks.map(task => {
          const { name, item: i } = this.getItemAndPath(item, path, task);
          return this.getRenameFiles(task.files, outputPath, name, i);
        });
        const files = getFiles.flat();
        if (createFiles) {
          await new Promise(resolve => {
            files.forEach(file => {
              copyFileSync(file.oldPath, file.newPath);
            });
            resolve(path);
          });
        }
        if (cover && createCover) {
          await new Promise(resolve => {
            const outPut = outputPath + '/' + name + '.pdf';
            resolve(GenerateFiles.coverV2(name, outPut, { fontSize: 40 }));
          });
        }
        const nextData = { rootId, rootLevel, item, path };
        const next: MergeLevels[] = await this.mergePDFList(
          list,
          outputPath,
          nextData,
          { createFiles, createCover }
        );
        const data = { id: rootId, name, cover, files };
        if (!next.length) return data;
        return { ...data, next };
      }
    );

    return await Promise.all(newList);
  }

  public static async listByUpdate(
    list: { id: number; index: number }[],
    quantity: number = -1
  ) {
    const updateListPerLevel = list.map(({ id, index }) => {
      const data = { index: index + quantity };
      const update = prisma.basicLevels.update({ where: { id }, data });
      return update;
    });
    return prisma.$transaction(updateListPerLevel);
  }

  public static async mergePDFs(
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
    getBasicList;
    // const list = this.folderlist(getBasicList, {
    //   rootId: 0,
    //   rootLevel: 0,
    //   item: '',
    //   path: 'compress_cp/basic',
    // });
    // list;
    // const parseFiles = list.map(file => file as FolderBasicLevelList);
    // if (typeFile === 'pdf') {
    //   mkdirSync('compress_cp/filemerge', { recursive: true });
    //   await this.parsingPathMerge(parseFiles);
    //   const patito2 = readdirSync('compress_cp/filemerge');
    //   const patito3 = patito2.map(value => 'compress_cp/filemerge/' + value);
    //   console.log(patito3);
    //   await GenerateFiles.merge(patito3, 'compress_cp/mergetask.pdf');
    //   // const sizeMerge = statSync('compress_cp/mergetask.pdf').size;
    //   // console.log(sizeMerge);
    //   setTimeout(() => {
    //     rmSync('compress_cp/filemerge', { recursive: true });
    //   }, 4000);
    // }

    return this.listFilter;
  }

  public static listFilter: { name: string; files: string[] }[] = [];

  public static async parsingPathMerge(list: FolderBasicLevelList[]) {
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

  private static getItemAndPath(
    rootItem: string,
    rootPath: string,
    { index, typeItem, name }: Pick<BasicLevels, 'index' | 'typeItem' | 'name'>,
    coverName: boolean = false
  ) {
    const findItem = numberToConvert(index, typeItem);
    const item = rootItem + (rootItem ? '.' : '') + findItem;
    const parseName = item + (coverName ? '. ' : '. ') + name;
    const path = rootPath + '/' + item + '. ' + name;
    return { item, path, name: parseName };
  }

  private static getRenameFiles(
    files: BasicFiles[],
    rootPath: string,
    rootName: string,
    rootItem?: string
  ) {
    const countExt = this.fileCounter(files);
    return files.map(({ dir, name: filename, id, type }) => {
      const oldPath = dir + '/' + filename;
      const originalName = filename.split('$$').at(-1) || filename;
      const _rootItem = rootItem ? rootItem + '. ' : '.';
      const newPath = rootPath + '/' + _rootItem + originalName;
      if (type === 'UPLOADS') {
        const ext = filename.split('.').at(-1) || '';
        countExt[ext] -= 1;
        const pivot = countExt[ext] >= 1 ? ` (${countExt[ext]})` : '';
        const newFileName = rootName + pivot + '.' + ext;
        const newPath = rootPath + '/' + newFileName;
        return { id, oldPath, newPath };
      }
      return { id, oldPath, newPath };
    });
  }

  private static async listByDelete(rootId: BasicLevels['rootId']) {
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

  private static async findRoot(id: number) {
    const root = await prisma.basicLevels.findUnique({ where: { id } });
    if (!root) return { stagesId: 0, rootLevel: 0, typeIndex: null };
    const { stagesId, level: rootLevel, typeItem: typeIndex, levelList } = root;
    return { stagesId, rootLevel, typeIndex, levelList };
  }

  public static async duplicate(
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

  private static fileCounter(files: BasicFiles[]) {
    const countExt =
      files?.reduce((acc: ObjectNumber, value) => {
        const ext = value.name.split('.').at(-1) || '';
        acc[ext] = (acc[ext] || 0) + 1;
        return acc;
      }, {}) || {};
    return countExt;
  }
}

export default BasicLevelServices;
