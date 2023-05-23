import { Projects, Users, WorkAreas, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { projectPick } from '../utils/format.server';

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

  static async create({
    name,
    description,
    untilDate,
    userId,
    startDate,
  }: projectPick & { userId: Users['id'] }) {
    const newProject = await prisma.projects.create({
      data: {
        name,
        description,
        startDate,
        untilDate,
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
    }: Projects & { userId: Users['id'] }
  ) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateProject = await prisma.projects.update({
      where: { id },
      data: {
        name,
        description,
        startDate,
        untilDate,
        status,
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
