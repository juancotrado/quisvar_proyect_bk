import { Specialities, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

class SpecialitiesServices {
  static async getAll() {
    try {
      const getSpecialities = await prisma.specialities.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              projects: true,
            },
          },
        },
      });
      if (getSpecialities.length == 0)
        throw new AppError('No se pudo encontrar las areas de trabajo', 404);
      return getSpecialities;
    } catch (error) {
      throw error;
    }
  }

  static async find(id: Specialities['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findSpeciality = await prisma.specialities.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { name: 'asc' },
          include: {
            areas: {
              select: {
                id: true,
                name: true,
              },
            },
            moderator: {
              select: {
                id: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    dni: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!findSpeciality)
      throw new AppError(
        'No se pudo encontrar el registro de especialidades',
        404
      );
    return findSpeciality;
  }

  static async create({ name }: Specialities) {
    const newSpeciality = await prisma.specialities.create({
      data: { name },
    });
    return newSpeciality;
  }

  static async update(id: Specialities['id'], { name }: Specialities) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateSpeciality = await prisma.specialities.update({
      where: { id },
      data: { name },
    });
    return updateSpeciality;
  }

  static async delete(id: Specialities['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const deleteSpeciality = await prisma.specialities.delete({
      where: { id },
    });
    return deleteSpeciality;
  }
}
export default SpecialitiesServices;
