import { Specialities, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

class SpecialitiesServices {
  static async getAll() {
    try {
      const getSpecialities = await prisma.sector.findMany({
        include: {
          specialities: {
            orderBy: { name: 'asc' },
            include: {
              _count: {
                select: {
                  projects: true,
                },
              },
            },
          },
        },
      });
      // const getSpecialities = await prisma.specialities.findMany({
      //   orderBy: { name: 'asc' },
      //   include: {
      //     _count: {
      //       select: {
      //         projects: true,
      //       },
      //     },
      //   },
      // });
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
            specialists: {
              select: {
                career: true,
                name: true,
                phone: true,
                zip: true,
              },
            },
            stage: { select: { id: true, name: true } },
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
    const groupProjects = await prisma.groupProjects.findMany({
      select: { id: true },
    });
    if (!findSpeciality)
      throw new AppError(
        'No se pudo encontrar el registro de especialidades',
        404
      );
    const { projects, ...speciality } = findSpeciality;
    const groups = groupProjects
      .map(_project => ({
        id: _project.id,
        projects: projects.filter(p => p.groupId == _project.id),
      }))
      .filter(p => p.projects.length);
    return { ...speciality, groups };
  }

  static async create({ name, cod, sectorId }: Specialities) {
    const newSpeciality = await prisma.specialities.create({
      data: { name, cod, sectorId },
    });
    return newSpeciality;
  }

  static async update(id: Specialities['id'], { name, cod }: Specialities) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateSpeciality = await prisma.specialities.update({
      where: { id },
      data: { name, cod },
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
