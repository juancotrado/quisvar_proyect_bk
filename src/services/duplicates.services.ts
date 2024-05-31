/* eslint-disable @typescript-eslint/no-unused-vars */
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import AppError from '../utils/appError';
import {
  BasicLevels,
  Contratc,
  Files,
  Levels,
  Projects,
  Stages,
  SubTasks,
  prisma,
} from '../utils/prisma.server';
import PathServices from './paths.services';
import {
  BasicTaskFiles,
  GetDuplicateBasicLevels,
  GetDuplicateLevels,
  SubTaskFiles,
} from 'types/types';
import {
  getPathProject,
  getPathStage,
  getRootItem,
  numberToConvert,
  toEditablesFiles,
} from '../utils/tools';
import LevelsServices from './levels.services';
import SubTasksServices from './subtasks.services';
import StageServices from './stages.services';
import BasicLevelServices from './basiclevels.services';
import lodash from 'lodash';

class DuplicatesServices {
  static async project(
    id: Projects['id'],
    name: string,
    contractId: Contratc['id']
  ) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    if (!contractId) throw new AppError('Oops!, ID invalido', 400);
    const getProyect = await prisma.projects.findUnique({
      where: { id },
      select: {
        userId: true,
        typeSpecialityId: true,
        stages: { select: { id: true, name: true }, take: 1 },
      },
    });
    if (!getProyect)
      throw new AppError('No se pudo encontrar el proyecto', 404);
    //----------------------------create_project--------------------------------------
    const { stages, ..._data } = getProyect;
    const data = { name, ..._data };
    const createNewProject = await prisma.projects.create({
      data: { ...data, contractId },
    });
    const { id: projectId } = createNewProject;
    //----------------------------create_files--------------------------------------
    const path = await getPathProject(projectId, 'UPLOADS');
    // const editablePath = toEditablesFiles(path);
    const modelPath = toEditablesFiles(path, 'MODEL');
    const reviewPath = toEditablesFiles(path, 'REVIEW');
    mkdirSync(modelPath, { recursive: true });
    mkdirSync(reviewPath, { recursive: true });
    // mkdirSync(editablePath, { recursive: true });
    mkdirSync(path, { recursive: true });
    //------------------------------------------------------------------------------
    const newStages = stages.map(async ({ id, name }) => {
      return await this.stage(id, name, projectId);
    });
    const _stages = await Promise.all(newStages);
    return { ...createNewProject, stage: _stages };
  }

  static async stage(id: Stages['id'], name: string, projectId?: number) {
    if (!id) throw new AppError('Oops!,ID invalido?', 400);
    const param: 'ID' | 'ROOT' = projectId ? 'ROOT' : 'ID';
    const _id = projectId ? projectId : id;
    const duplicate = await StageServices.duplicate(_id, name, param);
    if (duplicate)
      throw new AppError(
        'Oops!,Ya se registro esta etapa en este proyecto',
        400
      );
    const getStage = await prisma.stages.findUnique({
      where: { id },
      select: {
        projectId: true,
        name: true,
        levels: {
          orderBy: { item: 'asc' },
          include: {
            subTasks: { include: { files: { where: { type: 'MODEL' } } } },
          },
        },
      },
    });
    if (!getStage)
      throw new AppError('Oops!,no se pudo encontrar el nivel', 400);
    //----------------------------create_stage--------------------------------------
    const createStage = await prisma.stages.create({
      data: { name, projectId: projectId ? projectId : getStage.projectId },
    });
    const { id: stageId } = createStage;
    //----------------------------create_files--------------------------------------
    const path = await getPathStage(createStage.id, 'UPLOADS');
    const editablePath = toEditablesFiles(path);
    const modelPath = toEditablesFiles(path, 'MODEL');
    const reviewPath = toEditablesFiles(path, 'REVIEW');
    mkdirSync(modelPath, { recursive: true });
    mkdirSync(reviewPath, { recursive: true });
    // mkdirSync(editablePath, { recursive: true });
    mkdirSync(path, { recursive: true });
    //------------------------------------------------------------------------------
    const nextLevel = this.getList(getStage.levels, 0, 0, '', 'ABC', stageId);
    const levels = await this.createLevel(nextLevel, 0, path, modelPath);
    return { ...createStage, levels };
  }

  static async level(lvlId: Levels['id'], _name: string) {
    if (!lvlId) throw new AppError('Oops!, ID invalido', 400);
    const rootLevel = await prisma.levels.findUnique({
      where: { id: lvlId },
      include: {
        subTasks: { include: { files: { where: { type: 'MODEL' } } } },
      },
    });
    if (!rootLevel) throw new AppError('No se pudó encontrar nivel', 400);
    const duplicate = await LevelsServices.duplicate(lvlId, 0, _name, 'ID');
    const { quantity, duplicated } = duplicate;
    if (duplicated) throw new AppError('Ya se registro el nombre', 400);
    const { stagesId, level } = rootLevel;
    const { id, item, typeItem, subTasks, index: i, ...otherProps } = rootLevel;
    //--------------------------get_new_item---------------------------------------
    const { rootItem } = getRootItem(item);
    const newRootItem = rootItem ? rootItem + '.' : '';
    const index = quantity + 1;
    const _type = numberToConvert(index, typeItem);
    if (!_type) throw new AppError('excediste Limite de conversion', 400);
    const _item = newRootItem + _type + '.';
    //--------------------------create_level---------------------------------------
    const data = { ...otherProps, typeItem, name: _name, item: _item, index };
    const newLevel = await prisma.levels.create({ data });
    //---------------------------create_file---------------------------------------
    const path = await PathServices.level(newLevel.id);
    const editablePath = toEditablesFiles(path);
    mkdirSync(path, { recursive: true });
    // mkdirSync(editablePath, { recursive: true });
    //----------------------------get_levels---------------------------------------
    const getList = await prisma.levels.findMany({
      where: { stagesId, level: { gt: level } },
      orderBy: { item: 'asc' },
      include: {
        subTasks: { include: { files: { where: { type: 'MODEL' } } } },
      },
    });
    //-------------------------duplicate_subtasks---------------------------------
    const _subtasks = newLevel
      ? await this.listSubtask(subTasks, newLevel)
      : [];
    //----------------------------------------------------------------------------
    const nextLevel = this.getList(getList, lvlId, level, _item, typeItem);
    const createDuplicate = await this.createLevel(
      nextLevel,
      newLevel.id,
      path
    );
    //----------------------------------------------------------------------------
    return {
      ...data,
      subTasks: _subtasks,
      createDuplicate,
    };
  }

  static async basicLevel(lvlId: Levels['id'], name: string) {
    if (!lvlId) throw new AppError('Oops!, ID invalido', 400);
    const rootLevel = await prisma.basicLevels.findUnique({
      where: { id: lvlId },
      include: {
        subTasks: { include: { files: { where: { type: 'MODEL' } } } },
      },
    });
    if (!rootLevel) throw new AppError('No se pudó encontrar nivel', 400);
    const duplicate = await BasicLevelServices.duplicate(lvlId, 0, name, 'ID');
    const { quantity, duplicated } = duplicate;
    if (duplicated) throw new AppError('Ya se registro el nombre', 400);
    const { stagesId, level } = rootLevel;
    const { subTasks, ...otherProps } = lodash.omit(rootLevel, ['id', 'name']);
    //--------------------------create_level---------------------------------------
    const data = { ...otherProps, name, index: quantity + 1 };
    const newLevel = await prisma.basicLevels.create({ data });
    //----------------------------get_levels---------------------------------------
    const getList = await prisma.basicLevels.findMany({
      where: { stagesId, level: { gt: level } },
      orderBy: { index: 'asc' },
      include: {
        subTasks: { include: { files: { where: { type: 'MODEL' } } } },
      },
    });
    //-------------------------duplicate_subtasks---------------------------------
    const _subtasks = newLevel
      ? await this.listBasictask(subTasks, newLevel)
      : [];
    const nextLevel = this.getBasicList(
      getList,
      lvlId,
      level,
      newLevel.stagesId
    );
    const createDuplicate = await this.createBasicLevel(
      nextLevel,
      newLevel.id,
      newLevel.levelList,
      ''
    );
    return {
      ...data,
      subTasks: _subtasks,
      createDuplicate,
    };
  }

  static async subTask(_id: SubTasks['id'], name: string) {
    const verify = await SubTasksServices.findDuplicate(name, _id, 'ID');
    const { duplicated, quantity } = verify;
    if (duplicated) throw new AppError('Nombre registrado anteriormente', 404);
    const getSubTask = await prisma.subTasks.findUnique({
      where: { id: _id },
      select: {
        typeItem: true,
        price: true,
        days: true,
        index: true,
        files: { where: { type: 'MODEL' } },
        Levels: { select: { id: true, item: true } },
      },
    });
    if (!getSubTask) throw new AppError('Ops!, no se pudo encontrar', 404);
    const { files, Levels, index, ...subTaskData } = getSubTask;
    const newPath = await PathServices.level(Levels.id);
    const newEditables = newPath.replace('projects', 'editables');
    //--------------------------set_new_item-----------------------------
    const { item: rootItem, id: levels_Id } = Levels;
    const parseItem = rootItem ? rootItem : '';
    const lastItem = numberToConvert(index + 1, subTaskData.typeItem);
    if (!lastItem) throw new AppError('excediste Limite de conversion', 400);
    const item = parseItem + lastItem + '.';
    //--------------------------set_new_subtasks-------------------------
    const status: SubTasks['status'] = 'UNRESOLVED';
    const data = {
      ...subTaskData,
      status,
      name,
      item,
      levels_Id,
      index: index + 1,
    };
    const newSubTask = await prisma.subTasks.create({ data });
    //--------------------------set_new_files----------------------------
    const hash = new Date().getTime();
    const _files = files.map(
      ({ id, assignedAt, feedbackId, subTasksId, ...data }) => {
        const nameFile = data.name.split('$$')[1];
        const name = `${hash}$$${nameFile}`;
        copyFileSync(`${data.dir}/${data.name}`, `${data.dir}/${name}`);
        return { ...data, name, subTasksId: newSubTask.id };
      }
    );
    await prisma.files.createMany({ data: _files });
    //------------------------------------------------------------------
    const list = await prisma.subTasks.findMany({
      where: {
        levels_Id,
        index: { gt: index },
        id: {
          not: newSubTask.id,
        },
      },
      orderBy: { index: 'asc' },
      include: {
        files: {
          where: { OR: [{ type: 'UPLOADS' }, { type: 'EDITABLES' }] },
          select: { id: true, dir: true, name: true, type: true },
        },
      },
    });
    //--------------------------------------------------------------
    await SubTasksServices.updateBlock(
      list,
      Levels.item,
      newPath,
      newEditables,
      index + 2
    );
    //--------------------------------------------------------------
    return { ...newSubTask, files: _files };
  }

  static async listSubtask(
    list: SubTaskFiles[],
    { item: rootItem, typeItem, id: rootId }: Levels,
    stagePath?: string
  ) {
    const newSubTaks = list.map(async ({ id, files, ...subtask }) => {
      const { levels_Id, createdAt, updatedAt, item, ...data } = subtask;
      const status = 'UNRESOLVED';
      //--------------------------set_new_item-----------------------------
      const { lastItem } = getRootItem(subtask.item);
      const parseItem = rootItem ? rootItem : '';
      const newItem = parseItem + lastItem + '.';
      // subtask.typeItem === typeItem ? parseItem + lastItem : lastItem;
      //--------------------------set_new_subtasks-------------------------
      const _newSubTaks = await prisma.subTasks.create({
        data: { ...data, status, item: newItem, levels_Id: rootId },
      });
      //--------------------------set_new_files----------------------------
      const hash = new Date().getTime();
      const newFiles = files.map(
        ({ id, assignedAt, feedbackId, subTasksId, dir, ...data }) => {
          const getName = data.name.split('$')[1];
          const name = `${hash}$${getName}`;
          const _dir = stagePath ? stagePath : dir;
          copyFileSync(`${dir}/${data.name}`, `${_dir}/${name}`);
          return {
            ...data,
            dir: _dir,
            name,
            subTasksId: _newSubTaks.id,
          };
        }
      );
      const _files: Files[] = newFiles.map(file => ({
        assignedAt: new Date(),
        id: 0,
        feedbackId: 0,
        ...file,
      }));
      await prisma.files.createMany({ data: newFiles });
      //------------------------------------------------------------------
      return { ..._newSubTaks, files: _files };
    });
    return await Promise.all(newSubTaks);
  }

  static async listBasictask(
    list: BasicTaskFiles[],
    { id: rootId }: BasicLevels,
    stagePath?: string
  ) {
    const newSubTaks = list.map(({ id, files, ...subtask }) => {
      const { levels_Id, createdAt, updatedAt, ...data } = subtask;
      //--------------------------set_new_files----------------------------
      const hash = new Date().getTime();
      const newFiles = files.map(file => {
        const name = hash + '$$' + file.name.split('$$')[1];
        const data = lodash.pick(file, ['type', 'dir']);
        const src = file.dir + '/' + file.name;
        if (existsSync(src)) copyFileSync(src, file.dir + '/' + name);
        return { ...data, name };
      });
      return prisma.basicTasks.create({
        data: {
          ...data,
          status: 'UNRESOLVED',
          levels_Id: rootId,
          files: { createMany: { data: newFiles } },
        },
        include: { files: true },
      });
    });
    return await prisma.$transaction(newSubTaks);
  }

  static async createBasicLevel(
    array: GetDuplicateBasicLevels[],
    mainId: number,
    history: number[],
    stagePath?: string
  ) {
    const levelList = [...history, mainId];
    const createList = array.map(({ ...level }) => {
      const data = lodash.omit(level, [
        'id',
        'next',
        'subTasks',
        'rootId',
        'levelList',
      ]);
      return prisma.basicLevels.create({
        data: { ...data, rootId: mainId, levelList },
      });
    });
    const getNewList = await prisma.$transaction(createList);
    //---------------------------create_file---------------------------------------
    const list = array.map(async ({ id, next, subTasks, ...level }) => {
      const newLevel = getNewList.find(data => data.index === level.index)!;
      //-------------------------duplicate_subtasks---------------------------------
      const _subTasks =
        newLevel && subTasks
          ? await this.listBasictask(subTasks, newLevel, stagePath)
          : [];
      // //----------------------------------------------------------------------------
      if (!next) return { ...level, id, subTasks: _subTasks };
      type Next = GetDuplicateBasicLevels[];
      const _next: Next = await this.createBasicLevel(
        next,
        newLevel.id,
        levelList,
        stagePath
      );
      return { ...level, id, subTasks, next: _next };
    });
    return Promise.all(list);
  }

  static async createLevel(
    array: GetDuplicateLevels[],
    mainId: number,
    rootPath: string,
    stagePath?: string
  ) {
    const list = array.map(async ({ id, next, subTasks, ...level }) => {
      const data = { ...level, rootId: mainId };
      const newLevel = await prisma.levels.create({ data });
      //---------------------------create_file---------------------------------------
      const path = rootPath + '/' + newLevel.item + newLevel.name;
      // const editablePath = toEditablesFiles(path);
      if (newLevel) {
        mkdirSync(path, { recursive: true });
        // mkdirSync(editablePath, { recursive: true });
      }
      //-------------------------duplicate_subtasks---------------------------------
      const _subtasks =
        newLevel && subTasks
          ? await this.listSubtask(subTasks, newLevel, stagePath)
          : [];
      //----------------------------------------------------------------------------
      if (!next) return { ...level, id, subTasks: _subtasks };
      type Next = GetDuplicateLevels[];
      const _next: Next = await this.createLevel(
        next,
        newLevel.id,
        path,
        stagePath
      );
      return { ...level, id, subTasks, next: _next };
    });
    return Promise.all(list);
  }

  static getBasicList(
    array: GetDuplicateBasicLevels[],
    _rootId: number,
    _rootLevel: number,
    _stageId?: number
  ) {
    const findList = array.filter(
      ({ rootId, rootLevel }) => rootId === _rootId && rootLevel === _rootLevel
    );
    const list = array.filter(value => !findList.includes(value));
    if (!findList.length) return [];
    const newList = findList.map(({ subTasks, stagesId: stgId, ...value }) => {
      const stagesId = _stageId ?? stgId;
      let data;
      if (subTasks && subTasks.length) data = { subTasks };
      const props = { ...value, stagesId };
      const next: typeof findList = this.getBasicList(
        list,
        value.id,
        value.level,
        stagesId
      );
      if (!next.length) return { ...props, ...data };
      return { ...props, ...data, next };
    });
    return newList;
  }

  static getList(
    array: GetDuplicateLevels[],
    _rootId: number,
    _rootLevel: number,
    newRootItem: string,
    _typeItem: Levels['typeItem'],
    _stageId?: number
  ) {
    const findList = array.filter(
      ({ rootId, rootLevel }) => rootId === _rootId && rootLevel === _rootLevel
    );
    const list = array.filter(value => !findList.includes(value));
    if (!findList.length) return [];
    const newList = findList.map(({ item, subTasks, stagesId, ...value }) => {
      //--------------------------set_new_item--------------------------------------
      const { lastItem } = getRootItem(item);
      const parseRootItem = newRootItem ? newRootItem : '';
      const _item = parseRootItem + lastItem + '.';
      // value.typeItem === _typeItem ? parseRootItem + lastItem : lastItem;
      //--------------------------set_new_subtasks-----------------------------------
      const _subtasks = subTasks?.map(({ item, ...s }) => {
        const { rootItem, lastItem } = getRootItem(item);
        const _root = rootItem ? rootItem + '.' : '';
        const _item = _root + lastItem + '.';
        // const _item = s.typeItem === _typeItem ? _root + lastItem : lastItem;
        return { item: _item, ...s };
      });
      //---------------------------------------------------------------------------
      const { level, id } = value;
      const stgID = _stageId ? _stageId : stagesId;
      type Next = typeof findList;
      const next: Next = this.getList(
        list,
        id,
        level,
        _item,
        value.typeItem,
        stgID
      );
      const data = {
        item: _item,
        stagesId: stgID,
        ...value,
        subTasks: _subtasks,
      };
      if (!next.length) return data;
      return { ...data, next };
    });
    return newList;
  }
}

export default DuplicatesServices;
