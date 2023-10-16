import AppError from '../utils/appError';
import { AreaSpecialty, prisma } from '../utils/prisma.server';

class AreaSpecialtyServices {
  static async createAreaSpecialty(data: AreaSpecialty) {
    console.log(data);

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

    return areas;
  }
}
export default AreaSpecialtyServices;
