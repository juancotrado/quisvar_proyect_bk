import { copyFileSync, cp, mkdirSync } from 'fs';
import AppError from '../utils/appError';
import {
  Files,
  Levels,
  Projects,
  Stages,
  SubTasks,
  prisma,
} from '../utils/prisma.server';
import PathServices from './paths.services';
import PathLevelServices from './path_levels.services';
import { GetDuplicateLevels, ProjectDir, SubTaskFiles } from 'types/types';
import Queries from '../utils/queries';
import { getRootItem, numberToConvert, toEditablesFiles } from '../utils/tools';
import LevelsServices from './levels.services';
import SubTasksServices from './subtasks.services';

class DuplicatesServices {
  static async project(id: Projects['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const getProyect = await prisma.projects.findUnique({
      where: { id },
      select: {
        CUI: true,
        name: true,
        userId: true,
        description: true,
        startDate: true,
        untilDate: true,
        department: true,
        province: true,
        district: true,
        typeSpecialityId: true,
        stages: { select: { id: true } },
        specialists: Queries.selectSpecialist,
        company: Queries.selectCompany,
        consortium: Queries.selectConsortium,
      },
    });
    if (!getProyect)
      throw new AppError('No se pudo encontrar el proyecto', 404);
    const { specialists, company, consortium, stages, name, ..._data } =
      getProyect;
    const data = {
      name: name + '-copia',
      specialists: { createMany: { data: specialists } },
      ..._data,
    };
    const createNewProject = await prisma.projects.create({ data });
    const getPath = async (id: number, type: ProjectDir) => {
      return await PathLevelServices.pathProject(id, type);
    };
    const modelpath = await getPath(createNewProject.id, 'MODEL');
    const reviewpath = await getPath(createNewProject.id, 'REVIEW');
    const path = await getPath(createNewProject.id, 'UPLOADS');
    if (createNewProject && path) {
      mkdirSync(modelpath);
      mkdirSync(reviewpath);
      mkdirSync(path);
    }
    const newStages = stages.map(async stage => {
      return await this.stage(stage.id, createNewProject.id);
    });
    if (company) {
      const newCompany = { projectId: createNewProject.id, ...company };
      await prisma.company.createMany({ data: newCompany });
    }
    if (consortium) {
      const { companies, ..._consortium } = consortium;
      const newConsortium = {
        projectId: createNewProject.id,
        companies: { createMany: { data: companies } },
        ..._consortium,
      };
      await prisma.consortium.create({ data: newConsortium });
    }
    const listStage = await Promise.all(newStages);
    return { ...createNewProject, listStage };
  }

  static async stage(id: Stages['id'], project_id?: number) {
    if (!id) throw new AppError('Oops!,ID invalido?', 400);
    const findStage = await prisma.stages.findUnique({
      where: { id },
      select: {
        projectId: true,
        name: true,
        levels: { where: { rootId: 0 }, select: { id: true } },
      },
    });
    if (!findStage)
      throw new AppError('Oops!,no se pudo encontrar el nivel', 400);
    const name = project_id ? findStage.name : findStage.name + '-copia';
    const createStage = await prisma.stages.create({
      data: { name, projectId: project_id ? project_id : findStage.projectId },
    });
    const getPath = async (id: number, type: ProjectDir) => {
      return await PathLevelServices.pathStage(id, type);
    };
    const modelpath = await getPath(createStage.id, 'MODEL');
    const reviewpath = await getPath(createStage.id, 'REVIEW');
    const path = await getPath(createStage.id, 'UPLOADS');
    if (createStage && path) {
      mkdirSync(modelpath);
      mkdirSync(reviewpath);
      mkdirSync(path);
    }
    // const newListTask = findStage.levels.map(async level => {
    //   return await this.level(level.id, createStage.id);
    // });
    // const listLevel = await Promise.all(newListTask);
    const result = { ...createStage };
    return result;
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
    const duplicated = await LevelsServices.duplicate(lvlId, 0, _name, 'ID');
    const { quantity } = duplicated;
    const { stagesId, level } = rootLevel;
    const { id, item, typeItem, subTasks, ...otherProps } = rootLevel;
    const { rootItem } = getRootItem(item);
    //--------------------------get_new_item---------------------------------------
    const newRootItem = rootItem ? rootItem + '.' : '';
    const _type = numberToConvert(quantity + 1, typeItem);
    if (!_type) throw new AppError('excediste Limite de conversion', 400);
    const _item = newRootItem + _type;
    //--------------------------create_level---------------------------------------
    const data = { ...otherProps, typeItem, name: _name, item: _item };
    const newLevel = await prisma.levels.create({ data });
    // //---------------------------create_file---------------------------------------
    const path = await PathServices.level(newLevel.id);
    const editablePath = toEditablesFiles(path);
    mkdirSync(path, { recursive: true });
    mkdirSync(editablePath, { recursive: true });
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
    // return nextLevel;
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
        files: { where: { type: 'MODEL' } },
        Levels: { select: { id: true, item: true } },
      },
    });
    if (!getSubTask) throw new AppError('Ops!, no se pudo encontrar', 404);
    const { files, Levels, ..._data } = getSubTask;
    //--------------------------set_new_item-----------------------------
    const { item: rootItem, id: levels_Id } = Levels;
    const parseItem = rootItem ? rootItem + '.' : '';
    const _type = numberToConvert(quantity + 1, _data.typeItem);
    if (!_type) throw new AppError('excediste Limite de conversion', 400);
    const item = parseItem + _type;
    //--------------------------set_new_subtasks-------------------------
    const status: SubTasks['status'] = 'UNRESOLVED';
    const data = { ..._data, status, name, item, levels_Id };
    const _newSubTaks = await prisma.subTasks.create({ data });
    //--------------------------set_new_files----------------------------
    const hash = new Date().getTime();
    const _files = files.map(
      ({ id, assignedAt, feedbackId, subTasksId, ...data }) => {
        const nameFile = data.name.split('$')[1];
        const name = `${hash}$${nameFile}`;
        copyFileSync(`${data.dir}/${data.name}`, `${data.dir}/${name}`);
        return { ...data, name, subTasksId: _newSubTaks.id };
      }
    );
    await prisma.files.createMany({ data: _files });
    //------------------------------------------------------------------
    return { ..._newSubTaks, files: _files };
  }

  static async listSubtask(
    list: SubTaskFiles[],
    { item: rootItem, typeItem, id: rootId }: Levels
  ) {
    const newSubTaks = list.map(async ({ id, files, ...subtask }) => {
      const { levels_Id, createdAt, updatedAt, item, ...data } = subtask;
      const status = 'UNRESOLVED';
      //--------------------------set_new_item-----------------------------
      const { lastItem } = getRootItem(subtask.item);
      const parseItem = rootItem ? rootItem + '.' : '';
      const newItem =
        subtask.typeItem === typeItem ? parseItem + lastItem : lastItem;
      //--------------------------set_new_subtasks-------------------------
      const _newSubTaks = await prisma.subTasks.create({
        data: { ...data, status, item: newItem, levels_Id: rootId },
      });
      //--------------------------set_new_files----------------------------
      const hash = new Date().getTime();
      const newFiles = files.map(
        ({ id, assignedAt, feedbackId, subTasksId, ...data }) => {
          const getName = data.name.split('$')[1];
          const name = `${hash}$${getName}`;
          copyFileSync(`${data.dir}/${data.name}`, `${data.dir}/${name}`);
          return {
            ...data,
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

  static async createLevel(
    array: GetDuplicateLevels[],
    mainId: number,
    rootPath: string
  ) {
    const list = array.map(async ({ id, next, subTasks, ...level }) => {
      const data = { ...level, rootId: mainId };
      const newLevel = await prisma.levels.create({ data });
      //---------------------------create_file---------------------------------------
      const path = rootPath + '/' + newLevel.item + newLevel.name;
      const editablePath = toEditablesFiles(path);
      mkdirSync(path, { recursive: true });
      mkdirSync(editablePath, { recursive: true });
      //-------------------------duplicate_subtasks---------------------------------
      const _subtasks =
        newLevel && subTasks ? await this.listSubtask(subTasks, newLevel) : [];
      //----------------------------------------------------------------------------

      if (!next) return { ...level, id, subTasks: _subtasks };
      type Next = GetDuplicateLevels[];
      const _next: Next = await this.createLevel(next, newLevel.id, path);
      return { ...level, id, subTasks, next: _next };
    });
    return Promise.all(list);
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
    const newList = findList.map(({ item, subTasks, ...value }) => {
      //--------------------------set_new_item--------------------------------------
      const { lastItem } = getRootItem(item);
      const parseRootItem = newRootItem ? newRootItem + '.' : '';
      const _item =
        value.typeItem === _typeItem ? parseRootItem + lastItem : lastItem;
      //--------------------------set_new_subtasks-----------------------------------
      const _subtasks = subTasks?.map(({ item, ...s }) => {
        const { rootItem, lastItem } = getRootItem(item);
        const _root = rootItem ? rootItem + '.' : '';
        const _item = s.typeItem === _typeItem ? _root + lastItem : lastItem;
        return { item: _item, ...s };
      });
      //---------------------------------------------------------------------------
      const { level, id } = value;
      type Next = typeof findList;
      const next: Next = this.getList(list, id, level, _item, value.typeItem);
      const data = { item: _item, ...value, subTasks: _subtasks };
      if (!next.length) return data;
      return { ...data, next };
    });
    return newList;
  }
}

export default DuplicatesServices;
