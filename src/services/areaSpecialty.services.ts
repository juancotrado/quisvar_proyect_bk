import AppError from '../utils/appError';
import { AreaSpecialty, prisma } from '../utils/prisma.server';

class AreaSpecialtyServices {
  static async createAreaSpecialty(data: AreaSpecialty) {
    if (!data) throw new AppError(`Datos incorrectos`, 400);
    const newArea = await prisma.areaSpecialty.create({
      data: {
        ...data,
        specialistId: +data.specialistId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        untilDate: data.untilDate ? new Date(data.untilDate) : null,
      },
    });
    return newArea;
  }
  static async getAreaSpecialty(specialistId: AreaSpecialty['specialistId']) {
    const areas = await prisma.areaSpecialty.findMany({
      where: { specialistId },
    });

    const newData = Array.from(
      areas
        .reduce((map, elem) => {
          const { specialtyName, ...items } = elem;
          const oldData = map.get(specialtyName) || {
            specialtyName,
            datos: [],
          };
          oldData.datos.push(items);
          return map.set(specialtyName, oldData);
        }, new Map())
        .values()
    );
    return newData;
  }
}
export default AreaSpecialtyServices;
