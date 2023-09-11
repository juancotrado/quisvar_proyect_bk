import { LEVEL_DATA } from './../utils/tools';
import { Level } from 'types/types';
import AppError from '../utils/appError';
import { Projects, Stages, prisma } from '../utils/prisma.server';
import { calculateAndUpdateDataByLevel } from '../utils/tools';
import LevelsServices from './levels.services';

class StageServices {
  static async findMany() {
    const findStages = await prisma.stages.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return findStages;
  }
  static async find(id: Stages['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const findStage = await prisma.stages.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        levels: { where: { rootId: 0, stagesId: id } },
        project: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!findStage)
      throw new AppError('Oops!,No se pudo encontrar la etapa', 400);
    const newFindStage = findStage.levels.map(async level => {
      const levelCopy = { ...level, nextLevel: {} };
      const nextLevel = await LevelsServices.find(level.id);
      if (Object.keys(levelCopy).length) levelCopy.nextLevel = nextLevel;
      return {
        ...levelCopy,
        spending: 0,
        balance: 0,
        price: 0,
        details: {
          UNRESOLVED: 0,
          PROCESS: 0,
          INREVIEW: 0,
          DENIED: 0,
          DONE: 0,
          LIQUIDATION: 0,
          TOTAL: 0,
        },
      };
    });
    const result = (await Promise.all(newFindStage)) as Level[];
    const transformData: Level[] = [
      {
        id: 0,
        item: '',
        rootId: 0,
        spending: 0,
        balance: 0,
        price: 0,
        level: 0,
        rootLevel: 0,
        unique: false,
        stagesId: 0,
        userId: null,
        details: {
          UNRESOLVED: 0,
          PROCESS: 0,
          INREVIEW: 0,
          DENIED: 0,
          DONE: 0,
          LIQUIDATION: 0,
          TOTAL: 0,
        },
        name: findStage.project?.name || 'lEVEL',
        nextLevel: result,
      },
    ];
    return calculateAndUpdateDataByLevel(transformData);
  }

  static async create({ name, projectId }: Stages) {
    const createStage = await prisma.stages.create({
      data: { name, projectId },
    });
    return createStage;
  }

  static async update(id: Stages['id'], { name }: Stages) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const updateStage = await prisma.stages.update({
      where: { id },
      data: { name },
    });
    return updateStage;
  }

  static async delete(id: Stages['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const deleteStage = await prisma.stages.delete({
      where: { id },
    });
    return deleteStage;
  }
}
export default StageServices;
