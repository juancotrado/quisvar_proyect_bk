import { Projects, Specialities, Users, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { projectPick } from '../utils/format.server';
import { _dirPath } from '.';

class ProjectsServices {
  static async getAll() {
    try {
      const getProjects = await prisma.projects.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (getProjects.length == 0)
        throw new AppError('No se pudo encontrar las areas de trabajo', 404);
      return getProjects;
    } catch (error) {
      throw error;
    }
  }

  static async find(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findProject = await prisma.projects.findUnique({
      where: {
        id,
      },
      include: {
        moderator: {
          select: {
            profile: true,
          },
        },
        areas: {
          orderBy: {
            name: 'asc',
          },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!findProject)
      throw new AppError('No se pudo encontrar los proyectos registrados', 404);
    return findProject;
  }
  static async findShort(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findProject = await prisma.projects.findUnique({ where: { id } });
    if (!findProject)
      throw new AppError('No se pudo encontrar los proyectos registrados', 404);
    return findProject;
  }
  static async create({
    name,
    description,
    untilDate,
    userId,
    startDate,
    typeSpeciality,
    unique,
    specialityId,
    CUI,
  }: Required<projectPick>) {
    const newProject = await prisma.projects.create({
      data: {
        name,
        description,
        startDate,
        unique,
        untilDate,
        typeSpeciality,
        CUI,
        speciality: {
          connect: {
            id: specialityId,
          },
        },
        moderator: {
          connect: {
            id: userId,
          },
        },
      },
    });
    if (newProject.unique) {
      const area = await prisma.workAreas.create({
        data: {
          name,
          item: '0',
          project: {
            connect: { id: newProject.id },
          },
        },
      });
      return { ...newProject, workAreaId: area.id };
    }
    return { ...newProject, workAreaId: 0 };
  }

  static async update(
    id: Projects['id'],
    {
      name,
      description,
      startDate,
      untilDate,
      status,
      userId,
      CUI,
      typeSpeciality,
    }: Projects & { userId: Users['id'] } & {
      specialityId: Specialities['id'];
    }
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateProject = await prisma.projects.update({
      where: { id },
      data: {
        name,
        description,
        startDate,
        untilDate,
        typeSpeciality,
        CUI,
        status,
        // speciality: {
        //   connect: {
        //     id: specialityId,
        //   },
        // },
        moderator: {
          connect: { id: userId },
        },
      },
    });
    return updateProject;
  }

  static async delete(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const { unique } = await this.findShort(id);
    if (unique) {
      await prisma.workAreas.deleteMany({
        where: { projectId: id },
      });
    }

    const deleteProject = await prisma.projects.delete({
      where: { id },
    });
    return deleteProject;
  }
}
export default ProjectsServices;
