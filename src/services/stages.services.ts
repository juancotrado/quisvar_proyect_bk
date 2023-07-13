import { prisma } from '../utils/prisma.server';

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
}
export default StageServices;
