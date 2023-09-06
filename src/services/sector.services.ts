import AppError from '../utils/appError';
import { Sector, Specialities, prisma } from '../utils/prisma.server';
import Queries from '../utils/queries';

class SectorServices {
  static async getAll() {
    const getSectors = await prisma.sector.findMany({
      include: {
        specialities: {
          include: {
            typeSpecialities: {
              include: {
                projects: {
                  include: {
                    areas: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                    specialists: Queries.selectSpecialist,
                    company: Queries.selectCompany,
                    consortium: Queries.selectConsortium,
                    moderator: Queries.selectProfileUser,
                  },
                },
                _count: {
                  select: {
                    projects: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (getSectors.length == 0)
      throw new AppError('No se pudo encontrar los sectores de trabajo', 404);
    return getSectors;
  }
  static async create({ name }: Sector) {
    const newSector = await prisma.sector.create({
      data: { name },
    });
    return newSector;
  }
  static async update(id: Sector['id'], { name }: Sector) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateSector = await prisma.specialities.update({
      where: { id },
      data: { name },
    });
    return updateSector;
  }
  static async delete(id: Specialities['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const deleteSector = await prisma.specialities.delete({
      where: { id },
    });
    return deleteSector;
  }
}

export default SectorServices;
