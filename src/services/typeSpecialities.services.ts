import { TypeSpecialities } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import Queries from '../utils/queries';

class TypeSpecialitiesServices {
  static async getAll() {
    const getTypesSpecialities = await prisma.typeSpecialities.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });
    return getTypesSpecialities;
  }
  static async find(id: TypeSpecialities['id']) {
    const findTypeSpeciality = await prisma.typeSpecialities.findUnique({
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
            specialists: Queries.selectSpecialist,
            company: Queries.selectCompany,
            consortium: Queries.selectConsortium,
            stage: { select: { id: true, name: true } },
            moderator: Queries.selectProfileUser,
          },
        },
      },
    });
    const groupProjects = await prisma.groupProjects.findMany({
      select: { id: true },
    });
    if (!findTypeSpeciality)
      throw new AppError(
        'No se pudo encontrar el registro de especialidades',
        404
      );
    const { projects, ...speciality } = findTypeSpeciality;
    const groups = groupProjects
      .map(_project => ({
        id: _project.id,
        projects: projects.filter(p => p.groupId == _project.id),
      }))
      .filter(p => p.projects.length);
    return { ...speciality, groups };
  }

  static async create({ name, specialitiesId }: TypeSpecialities) {
    const newTypeSpeciality = await prisma.typeSpecialities.create({
      data: { name, specialitiesId },
    });
    return newTypeSpeciality;
  }

  static async update(id: TypeSpecialities['id'], { name }: TypeSpecialities) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateTypeSpeciality = await prisma.typeSpecialities.update({
      where: { id },
      data: { name },
    });
    return updateTypeSpeciality;
  }

  static async delete(id: TypeSpecialities['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const deleteTypeSpeciality = await prisma.typeSpecialities.delete({
      where: { id },
    });
    return deleteTypeSpeciality;
  }
}
export default TypeSpecialitiesServices;
