import AppError from '../utils/appError';
import {
  AreaSpecialtyNameList,
  AreaSpecialtyToSpecialty,
  ListSpecialties,
  prisma,
} from '../utils/prisma.server';

class AreaSpecialtyListServices {
  static async createAreaSpecialtyList(
    data: AreaSpecialtyNameList,
    id: ListSpecialties['id']
  ) {
    if (!data || !id) throw new AppError(`Datos incorrectos`, 400);
    const alreadyExist = await prisma.areaSpecialtyNameList.findFirst({
      where: {
        specialistId: data.specialistId,
        specialtyName: {
          some: {
            listSpecialtyId: id,
          },
        },
      },
    });
    if (alreadyExist)
      throw new AppError(`Ya se tiene la especialidad registrada`, 400);
    const newAreaName = await prisma.areaSpecialtyNameList.create({
      data,
    });
    await prisma.areaSpecialtyToSpecialty.create({
      data: {
        areaSpecialtyId: newAreaName.id,
        listSpecialtyId: id,
      },
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
        specialtyName: {
          select: {
            listSpecialty: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        areaSpecialtyName: true,
      },
    });
    return areas;
  }
  static async getAllSpecialistBySpeciality(
    id: AreaSpecialtyToSpecialty['listSpecialtyId']
  ) {
    const areas = await prisma.areaSpecialtyNameList.findMany({
      where: {
        specialtyName: {
          every: {
            listSpecialtyId: id,
          },
        },
      },
      include: {
        specialist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
          },
        },
      },
    });
    const list = areas.map(({ specialist }) => {
      return {
        id: specialist.id,
        firstName: specialist.firstName,
        lastName: specialist.lastName,
        dni: specialist.dni,
      };
    });
    return list;
  }
  static async updateAreaSpecialtyList(
    id: AreaSpecialtyNameList['id'],
    specialistId: ListSpecialties['id']
  ) {
    if (!specialistId || !id) throw new AppError(`Datos incorrectos`, 400);
    const newAreaName = await prisma.areaSpecialtyToSpecialty.update({
      where: {
        areaSpecialtyId_listSpecialtyId: {
          areaSpecialtyId: id,
          listSpecialtyId: specialistId,
        },
      },
      data: { listSpecialtyId: specialistId },
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
