import { copyFileSync, mkdirSync } from 'fs';
import AppError from '../utils/appError';
import {
  Levels,
  Projects,
  Stages,
  SubTasks,
  prisma,
} from '../utils/prisma.server';
import PathServices from './paths.services';
import PathLevelServices from './path_levels.services';
import { GetDuplicateLevels, ProjectDir } from 'types/types';
import Queries from '../utils/queries';
import { getRootItem } from '../utils/tools';
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
    const newListTask = findStage.levels.map(async level => {
      return await this.level(level.id, createStage.id);
    });
    const listLevel = await Promise.all(newListTask);
    const result = { ...createStage, listLevel };
    return result;
  }

  static async level(id: Levels['id'], stageId?: number, name?: string) {
    if (!id) throw new AppError('Oops!,ID invalido?', 400);
    const findLevel = await prisma.levels.findUnique({ where: { id } });
    if (!findLevel)
      throw new AppError('Oops!,no se pudo encontrar el nivel', 400);
    const { stagesId, rootId, ...data } = findLevel;
    const quantityLevel = await prisma.levels.count({
      where: { rootId, stagesId: stageId ? stageId : stagesId },
    });
    const _rootItem = findLevel.item.split('.').slice(0, -1).join('.');
    const stageItem = findLevel.item;
    const levelItem = (_rootItem ? _rootItem + '.' : '') + (quantityLevel + 1);
    const newItem = stageId ? stageItem : levelItem;
    // const newName = findLevel.name + (stageId ? '' : '-copia');
    const newLevel = await prisma.levels.create({
      data: {
        rootId,
        item: newItem,
        name: '',
        rootLevel: findLevel.rootLevel,
        level: findLevel.level,
        // unique: findLevel.unique,
        stagesId: stageId ? stageId : findLevel.stagesId,
      },
    });
    const newPath = await PathLevelServices.pathLevel(newLevel.id);
    if (newLevel && newPath) mkdirSync(newPath);
    const nextLevel = await this.duplicateLevel(
      id,
      newPath,
      newItem,
      newLevel.id,
      stageId
    );
    return { ...findLevel, newPath, nextLevel };
  }

  static async duplicateLevel(
    rootId: Levels['rootId'],
    dir: string,
    rootItem: string,
    newRootId: number,
    stageId?: number
  ) {
    const findList = await prisma.levels.findMany({
      where: { rootId },
      orderBy: { id: 'asc' },
    });
    if (findList.length === 0) return [];
    const newListTask = findList.map(async level => {
      const newItem = rootItem + '.' + level.item.split('.').at(-1);
      const path = dir + '/' + newItem + level.name;
      const newLevel = await prisma.levels.create({
        data: {
          rootId: newRootId,
          item: newItem,
          name: level.name,
          rootLevel: level.rootLevel,
          level: level.level,
          // unique: level.unique,
          stagesId: stageId ? stageId : level.stagesId,
        },
      });
      if (newLevel) mkdirSync(path);
      const nextLevel: typeof findList = await this.duplicateLevel(
        level.id,
        path,
        newItem,
        newLevel.id,
        stageId
      );
      const result = { ...level, path };
      if (nextLevel.length !== 0) return { ...result, nextLevel };
      return { ...result };
    });
    const result = await Promise.all(newListTask);
    return result;
  }
  static async subTask(_id: SubTasks['id'], _name: string) {
    const _subtask = await SubTasksServices.findDuplicate(_name, _id, 'ID');
    const { quantity, duplicated } = _subtask;
    if (duplicated) throw new AppError('Nombre registrado anteriormente', 404);
    const getSubTask = await prisma.subTasks.findUnique({
      where: { id: _id },
      include: { files: { where: { type: 'MODEL' } } },
    });
    if (!getSubTask) throw new AppError('Ops!, no se pudo encontrar', 404);
    const { files, item, createdAt, updatedAt, name, id, status, ...data } =
      getSubTask;
    const { rootItem } = getRootItem(item);
    const _item = `${item.length ? rootItem + '.' : ''}${quantity + 1}`;
    const duplicateSubTask = await prisma.subTasks.create({
      data: { ...data, name: _name, item: _item },
    });
    const filesList = files.map(({ userId, name, dir, type }) => ({
      userId,
      type,
      dir,
      name: duplicateSubTask.id + name,
      subTasksId: duplicateSubTask.id,
    }));
    const newFiles = await prisma.files.createMany({ data: filesList });
    return newFiles;
  }
  static async _duplicateLevel(lvlId: Levels['id'], _name: string) {
    if (!lvlId) throw new AppError('Oops!, ID invalido', 400);
    const rootLevel = await prisma.levels.findUnique({ where: { id: lvlId } });
    if (!rootLevel) throw new AppError('No se pudó encontrar nivel', 400);
    const duplicated = await LevelsServices.duplicate(lvlId, 0, _name, 'ID');
    const { quantity } = duplicated;
    const { stagesId, level } = rootLevel;
    const { id, item, ...otherProps } = rootLevel;
    const { rootItem } = getRootItem(item);
    const newItem = !item.length
      ? ''
      : (rootItem ? rootItem + '.' : '') + `${quantity + 1}`;
    //---------------------------------------------------------------------
    const data = { ...otherProps, name: _name, item: newItem };
    const newLevel = await prisma.levels.create({ data });
    //---------------------------------------------------------------------
    const getList = await prisma.levels.findMany({
      where: { stagesId, level: { gt: level } },
      orderBy: { item: 'asc' },
      include: {
        subTasks: { include: { files: { where: { type: 'MODEL' } } } },
      },
    });
    //---------------------------------------------------------------------
    const nextLevel = this.findList(getList, lvlId, level, newItem);
    const createDuplicate = await this.createLevel(nextLevel, newLevel.id);
    return createDuplicate;
  }
  static async createLevel(array: GetDuplicateLevels[], mainId: number) {
    array.forEach(async ({ id, rootId, subTasks, nextLevel, ...level }) => {
      const newLevel = await prisma.levels.create({
        data: { ...level, rootId: mainId },
      });
      if (subTasks)
        subTasks.forEach(
          async ({
            id,
            levels_Id,
            files,
            createdAt,
            updatedAt,
            ..._subtask
          }) => {
            const newSubTaks = await prisma.subTasks.create({
              data: {
                ..._subtask,
                status: 'UNRESOLVED',
                levels_Id: newLevel.id,
              },
            });
            if (files) {
              const newFiles = files.map(
                ({ id, assignedAt, feedbackId, subTasksId, ...data }) => ({
                  ...data,
                  name: `${newSubTaks.id}${data.name}`,
                  subTasksId: newSubTaks.id,
                })
              );
              await prisma.files.createMany({ data: newFiles });
            }
          }
        );
      if (nextLevel) await this.createLevel(nextLevel, newLevel.id);
    });
  }
  static findList(
    array: GetDuplicateLevels[],
    _rootId: number,
    _rootLevel: number,
    newRootItem: string
    // newRootId: number
  ) {
    const findList = array.filter(
      ({ rootId, rootLevel }) => rootId === _rootId && rootLevel === _rootLevel
    );
    const list = array.filter(value => !findList.includes(value));
    if (!findList.length) return [];
    const newList = findList.map(({ item, subTasks, ...value }) => {
      const { level, id, rootId, ...data } = value;
      const { lastItem } = getRootItem(item);
      const newItem = !newRootItem.length
        ? lastItem
        : newRootItem + '.' + lastItem;
      //---------------------------------------------------------------------------
      // const newLevel = await prisma.levels.create({
      //   data: {
      //     item: newItem,
      //     rootId: 2,
      //     ...data,
      //   },
      // });
      //---------------------------------------------------------------------------
      const _subtasks = subTasks?.map(({ ...s }) => {
        const { lastItem } = getRootItem(item);
        const _item = !newItem ? lastItem : newItem + '.' + lastItem;
        return { ...s, item: _item };
      });
      //---------------------------------------------------------------------------
      const nextLevel: typeof findList = this.findList(
        list,
        id,
        level,
        newItem
        // newLevel.id
      );
      if (!nextLevel.length)
        return { ...value, item: newItem, subTasks: _subtasks };
      return { ...value, item: newItem, subTasks: _subtasks, nextLevel };
    });
    return newList;
  }
}

export default DuplicatesServices;
