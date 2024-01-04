import { prisma } from '../utils/prisma.server';

class QueryServices {
  async updateData() {
    //----------------code-----------------------
    const getStages = await prisma.stages.groupBy({ by: 'id' });
    const patito = getStages.map(value => value.id);
    // const update = await prisma.stages.updateMany({
    //   where: { id: { in: patito } },
    //   data: {
    //     bachelorCost: 0,
    //     professionalCost: 0,
    //   },
    // });
    console.log(patito);
    return false;
  }
}

export default QueryServices;
