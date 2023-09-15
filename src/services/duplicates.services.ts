import { copyFileSync, mkdirSync } from 'fs';
import AppError from '../utils/appError';
import { Levels, Projects, Stages, prisma } from '../utils/prisma.server';
import PathServices from './paths.services';
import PathLevelServices from './path_levels.services';
import { ProjectDir } from 'types/types';
import Queries from '../utils/queries';

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

  static async level(id: Levels['id'], stageId?: number) {
    console.log(stageId, '<===');
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
    const newName = findLevel.name + (stageId ? '' : '-copia');
    const newLevel = await prisma.levels.create({
      data: {
        rootId,
        item: newItem,
        name: newName,
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
  static async duplicateSubTask(
    idOld: number,
    idNew: number,
    type: 'indexTaskId' | 'taskId' | 'task_2_Id' | 'task_3_Id',
    itemTask?: string
  ) {
    const listSubtasks = await prisma.subTasks.findMany({
      where: { [type]: idOld },
      select: {
        id: true,
        days: true,
        item: true,
        name: true,
        price: true,
        files: {
          where: { type: 'MATERIAL' },
          // { type: 'SUCCESSFUL' }
        },
      },
    });
    const newListSubTasks = listSubtasks.map(data => {
      const { files, id, item, ..._data } = data;
      const newItem = itemTask ? itemTask + item.slice(-2) : item;
      return { [type]: idNew, item: newItem, ..._data };
    });
    const newSubTaks = await prisma.subTasks.createMany({
      data: newListSubTasks,
    });
    const getIdSubTaks = await prisma.subTasks.findMany({
      where: { [type]: idNew },
      select: { id: true, item: true },
    });
    if (listSubtasks.length !== 0) {
      listSubtasks.forEach(async subtask => {
        const findSubTask = getIdSubTaks.filter(
          s => s.item.slice(-1) == subtask.item.slice(-1)
        );
        const _subtask_id = findSubTask[0].id;
        if (subtask.files.length !== 0) {
          const newFiles = await Promise.all(
            subtask.files.map(async file => {
              const { dir, id, subTasksId, name, ...data } = file;
              const newName = itemTask
                ? name.replace(subtask.item.slice(0, -2), itemTask)
                : name;
              if (file.type === 'MATERIAL') {
                const newDir = await PathServices.pathSubTask(
                  _subtask_id,
                  file.type
                );
                copyFileSync(`${dir}/${name}`, `${newDir}/${newName}`);
                return {
                  dir: newDir,
                  subTasksId: _subtask_id,
                  name: newName,
                  ...data,
                };
              }
              return file;
            })
          );
          // await prisma.files.createMany({ data: newFiles });
        }
      });
    }
    return newSubTaks;
  }
}

export default DuplicatesServices;
