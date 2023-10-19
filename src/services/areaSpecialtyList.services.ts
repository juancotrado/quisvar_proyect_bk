import AppError from '../utils/appError';
import { AreaSpecialtyNameList, prisma } from '../utils/prisma.server';

class AreaSpecialtyListServices {
  static async createAreaSpecialtyList(data: AreaSpecialtyNameList) {
    if (!data) throw new AppError(`Datos incorrectos`, 400);
    const newAreaName = await prisma.areaSpecialtyNameList.create({
      data,
    });
    return newAreaName;
  }
  static async getAreaSpecialtyList(
    specialistId: AreaSpecialtyNameList['specialistId']
  ) {
    const areas = await prisma.areaSpecialtyNameList.findMany({
      where: { specialistId },
      select: {
        id: true,
        specialtyName: true,
        areaSpecialtyName: true,
      },
    });
    return areas;
  }
  static async updateAreaSpecialtyList(
    id: AreaSpecialtyNameList['id'],
    { specialtyName }: AreaSpecialtyNameList
  ) {
    if (!specialtyName) throw new AppError(`Datos incorrectos`, 400);
    const newAreaName = await prisma.areaSpecialtyNameList.update({
      where: { id },
      data: { specialtyName },
    });
    return newAreaName;
  }
  static async deleteAreaSpecialtyList(id: AreaSpecialtyNameList['id']) {
    if (!id) throw new AppError(`Datos incorrectos`, 400);
    const newAreaName = await prisma.areaSpecialtyNameList.delete({
      where: { id },
    });
    return newAreaName;
  }
}
export default AreaSpecialtyListServices;
