import AppError from '../utils/appError';
import { Sector, Specialities, prisma } from '../utils/prisma.server';
import Queries from '../utils/queries';

class SectorServices {
  static async getAll() {
    const getSectors = await prisma.sector.findMany({
      include: {
        specialities: {
          orderBy: { id: 'asc' },
          include: {
            typeSpecialities: {
              orderBy: { id: 'asc' },
              include: {
                projects: {
                  orderBy: { id: 'asc' },
                  include: {
                    moderator: Queries.selectProfileUser,
                    stages: {
                      select: {
                        id: true,
                      },
                    },
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
    const updateSector = await prisma.sector.update({
      where: { id },
      data: { name },
    });
    return updateSector;
  }
  static async delete(id: Specialities['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const deleteSector = await prisma.sector.delete({
      where: { id },
    });
    return deleteSector;
  }
}

export default SectorServices;
