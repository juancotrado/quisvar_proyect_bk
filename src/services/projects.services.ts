import {
  Projects,
  Specialities,
  Stages,
  Users,
  prisma,
} from '../utils/prisma.server';
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
    const findProject = await prisma.projects.findUnique({
      where: { id },
      include: { stage: { select: { id: true, name: true } } },
    });
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
    stageId,
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
        stage: {
          connect: { id: stageId },
        },
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
        group: {
          create: {
            name,
          },
        },
      },
      include: {
        stage: {
          select: { id: true, name: true },
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
      stageId,
      untilDate,
      status,
      userId,
      CUI,
      typeSpeciality,
    }: Projects & { userId: Users['id'] } & {
      specialityId: Specialities['id'];
    } & { stageId: Stages['id'] }
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
        stage: { connect: { id: stageId } },
        moderator: {
          connect: { id: userId },
        },
      },
      include: { stage: { select: { id: true, name: true } } },
    });
    return updateProject;
  }

  static async delete(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const { unique, groupId } = await this.findShort(id);
    if (unique) {
      await prisma.workAreas.deleteMany({
        where: { projectId: id },
      });
    }
    const deleteProject = await prisma.projects.delete({
      where: { id },
      include: { stage: { select: { id: true, name: true } } },
    });
    const countProjects = await prisma.projects.count({ where: { groupId } });
    if (groupId && countProjects == 0) {
      await prisma.groupProjects.delete({ where: { id: groupId } });
    }
    return deleteProject;
  }
}
export default ProjectsServices;
