import { Specialities, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

class SpecialitiesServices {
  static async getAll() {
    try {
      const getSpecialities = await prisma.specialities.findMany({
        orderBy: { name: 'asc' },
      });
      if (getSpecialities.length == 0)
        throw new AppError('Could not found work areas', 404);
      return getSpecialities;
    } catch (error) {
      throw error;
    }
  }

  static async find(id: Specialities['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findSpeciality = await prisma.specialities.findUnique({
      where: { id },
      include: { projects: true },
    });
    if (!findSpeciality)
      throw new AppError('Could not found logs specialities', 404);
    return findSpeciality;
  }

  static async create({ name }: Specialities) {
    const newSpeciality = await prisma.specialities.create({
      data: { name },
    });
    return newSpeciality;
  }

  static async update(id: Specialities['id'], { name }: Specialities) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateSpeciality = await prisma.specialities.update({
      where: { id },
      data: { name },
    });
    return updateSpeciality;
  }

  static async delete(id: Specialities['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const deleteSpeciality = await prisma.specialities.delete({
      where: { id },
    });
    return deleteSpeciality;
  }
}
export default SpecialitiesServices;
