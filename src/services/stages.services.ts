import AppError from '../utils/appError';
import { Projects, Stages, prisma } from '../utils/prisma.server';
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
      },
    });
    if (!findStage)
      throw new AppError('Oops!,No se pudo encontrar la etapa', 400);
    const newFindStage = findStage.levels.map(async level => {
      const nextLevel = await LevelsServices.find(level.id);
      if (nextLevel.length !== 0) return { ...level, nextLevel };
      return level;
    });
    const result = await Promise.all(newFindStage);
    return result;
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
