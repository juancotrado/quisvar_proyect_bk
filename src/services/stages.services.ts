import AppError from '../utils/appError';
import { Projects, Stages, SubTasks, prisma } from '../utils/prisma.server';
import {
  calculateAndUpdateDataByLevel,
  sumPriceByStage,
  sumValues,
} from '../utils/tools';
import LevelsServices from './levels.services';
import { existsSync } from 'fs';
import Queries from '../utils/queries';
import PathServices from './paths.services';

class StageServices {
  static async findMany(projectId: Projects['id']) {
    const findStages = await prisma.stages.findMany({
      where: { projectId },
      select: { id: true, name: true },
    });
    return findStages;
  }
  static async findShort(id: Stages['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const findStage = await prisma.stages.findUnique({ where: { id } });
    if (!findStage) throw new AppError('Oops!, ID invalido', 400);
    return findStage;
  }
  static async find(id: Stages['id'], status?: SubTasks['status']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const findStage = await prisma.stages.findUnique({
      where: { id },
      include: { project: { select: { name: true } } },
    });
    if (!findStage)
      throw new AppError('Oops!,No se pudo encontrar la etapa', 400);
    const { name, project } = findStage;
    const projectName = project.name;
    const getList = await prisma.levels.findMany({
      where: { stagesId: id },
      orderBy: { index: 'asc' },
      include: {
        subTasks: {
          where: { status },
          orderBy: { index: 'asc' },
          include: {
            users: {
              select: { percentage: true, user: Queries.selectProfileUser },
            },
          },
        },
      },
    });
    const list = LevelsServices.findList(getList, 0, 0);
    const nextLevel = calculateAndUpdateDataByLevel(list);
    const total = sumValues(nextLevel, 'total');
    const _percentage = sumValues(nextLevel, 'percentage') / nextLevel.length;
    const percentage = Math.round(_percentage * 100) / 100;
    const totalValues = sumPriceByStage(getList);
    return {
      id,
      name,
      projectName,
      percentage,
      total,
      ...totalValues,
      nextLevel,
    };
    // const newFindStage = findStage.levels.map(async level => {
    //   const levelCopy = { ...level, nextLevel: {} };
    //   const nextLevel = await LevelsServices.find(level.id);
    //   if (Object.keys(levelCopy).length) levelCopy.nextLevel = nextLevel;
    //   return {
    //     ...levelCopy,
    //     spending: 0,
    //     balance: 0,
    //     price: 0,
    //     details: {
    //       UNRESOLVED: 0,
    //       PROCESS: 0,
    //       INREVIEW: 0,
    //       DENIED: 0,
    //       DONE: 0,
    //       LIQUIDATION: 0,
    //       TOTAL: 0,
    //     },
    //   };
    // });
    // const result = (await Promise.all(newFindStage)) as Level[];
    // const transformData: Level[] = [
    //   {
    //     id: 0,
    //     item: '',
    //     rootId: 0,
    //     spending: 0,
    //     balance: 0,
    //     price: 0,
    //     level: 0,
    //     rootLevel: 0,
    //     stagesId: 0,
    //     isInclude: false,
    //     userId: null,
    //     isArea: false,
    //     isProject: false,
    //     details: {
    //       UNRESOLVED: 0,
    //       PROCESS: 0,
    //       INREVIEW: 0,
    //       DENIED: 0,
    //       DONE: 0,
    //       LIQUIDATION: 0,
    //       TOTAL: 0,
    //     },
    //     name: findStage.project?.name || 'lEVEL',
    //     nextLevel: result,
    //   },
    // ];
    // return calculateAndUpdateDataByLevel(transformData);
  }

  static async duplicate(id: number, name: string, type: 'ID' | 'ROOT') {
    let projectId: number = id;
    if (name.includes('projects')) throw new AppError('Nombre reservado', 404);
    if (type === 'ID') {
      const project = await prisma.stages.findUnique({ where: { id } });
      if (!project) throw new AppError('Etapa no Encontrada', 404);
      projectId = project.projectId;
    }
    const getStages = await prisma.stages.groupBy({
      by: ['name'],
      where: { projectId },
    });
    const list = getStages.map(({ name }) => name);
    return list.includes(name);
  }
  static async create({ name, projectId }: Stages) {
    const duplicated = await this.duplicate(projectId, name, 'ROOT');
    if (duplicated) throw new AppError('Ops!,Nombre repetido', 400);
    const path = await PathServices.project(projectId, 'UPLOADS');
    console.log(path);
    if (!existsSync(path)) throw new AppError('Ops!,carpeta no existe', 404);
    const createStage = await prisma.stages.create({
      data: { name, projectId },
      include: { project: { select: { name: true, id: true } } },
    });
    return createStage;
  }

  static async update(id: Stages['id'], { name }: Stages) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const duplicated = await this.duplicate(id, name, 'ID');
    if (duplicated) throw new AppError('Ops!,Nombre repetido', 400);
    const path = await PathServices.stage(id, 'UPLOADS');
    if (!existsSync(path)) throw new AppError('Ops!,carpeta no existe', 404);
    const updateStage = await prisma.stages.update({
      where: { id },
      data: { name },
      include: { project: { select: { name: true } } },
    });
    return updateStage;
  }

  static async delete(id: Stages['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const path = await PathServices.stage(id, 'UPLOADS');
    if (!existsSync(path)) throw new AppError('Ops!,carpeta no existe', 404);
    const deleteStage = await prisma.stages.delete({
      where: { id },
      include: { project: { select: { name: true } } },
    });
    return deleteStage;
  }
}
export default StageServices;
