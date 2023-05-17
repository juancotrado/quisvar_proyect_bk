import { Projects, Users, WorkAreas, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { projectPick } from '../utils/format.server';

class ProjectsServices {
  static async getAll() {
    try {
      const getProjects = await prisma.projects.findMany({});
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
        tasks: {
          include: {
            employees: {
              select: {
                user: {
                  select: {
                    profile: {
                      select: {
                        firstName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!findProject) throw new AppError('Could not found user ', 404);
    return findProject;
  }

  static async create({
    name,
    description,
    price,
    untilDate,
    userId,
    startDate,
    workAreaId,
  }: projectPick & { userId: Users['id'] } & { workAreaId: WorkAreas['id'] }) {
    const newProject = await prisma.projects.create({
      data: {
        name,
        description,
        price,
        startDate,
        untilDate,
        moderator: {
          connect: {
            id: userId,
          },
        },
        workAreas: {
          connect: {
            id: workAreaId,
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
      price,
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
        price,
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