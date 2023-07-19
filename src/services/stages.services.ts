import AppError from '../utils/appError';
import { Stages, prisma } from '../utils/prisma.server';

class StageServices {
  static async findMany() {
    const findStages = await prisma.stages.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    // if (findStages.length == 0)
    //   throw new AppError(
    //     'No se pudo encontrar la lista, porque esta vacia',
    //     404
    //   );
    return findStages;
  }
  static async create({ name }: Stages) {
    const createStage = await prisma.stages.create({
      data: {
        name,
      },
    });
    return createStage;
  }
  static async update(id: Stages['id'], { name }: Stages) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const updateStage = await prisma.stages.update({
      where: { id },
      data: {
        name,
      },
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
