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
        throw new AppError('Could not found work areas', 404);
      return getProjects;
    } catch (error) {
      throw error;
    }
  }

  static async find(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
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
    if (!findProject) throw new AppError('Could not found logs project', 404);
    return findProject;
  }
  static async findShort(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findProject = await prisma.projects.findUnique({ where: { id } });
    if (!findProject) throw new AppError('Could not found logs project', 404);
    return findProject;
  }
  static async create({
    name,
    description,
    untilDate,
    userId,
    startDate,
    typeSpeciality,
    specialityId,
  }: Required<projectPick>) {
    const newProject = await prisma.projects.create({
      data: {
        name,
        description,
        startDate,
        untilDate,
        typeSpeciality,
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
    return newProject;
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
      typeSpeciality,
    }: Projects & { userId: Users['id'] } & {
      specialityId: Specialities['id'];
    }
  ) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateProject = await prisma.projects.update({
      where: { id },
      data: {
        name,
        description,
        startDate,
        untilDate,
        typeSpeciality,
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
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const deleteProject = await prisma.projects.delete({
      where: { id },
    });
    return deleteProject;
  }
}
export default ProjectsServices;
