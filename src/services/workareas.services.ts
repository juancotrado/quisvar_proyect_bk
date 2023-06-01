import {
  Projects,
  SubTasks,
  Tasks,
  Users,
  WorkAreas,
  prisma,
} from '../utils/prisma.server';
import AppError from '../utils/appError';

class WorkAreasServices {
  static async getAll() {
    try {
      const getWorkAreas = await prisma.workAreas.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          user: {
            select: {
              _count: true,
            },
          },
        },
      });
      if (getWorkAreas.length == 0)
        throw new AppError('Could not found work areas', 404);
      return getWorkAreas;
    } catch (error) {
      throw error;
    }
  }

  static async getReviewfromUser(userId: Users['id']) {
    const getTask = await prisma.subTasks.findMany({
      where: {
        status: 'INREVIEW',
        task: {
          indexTask: {
            workArea: {
              userId,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        task: {
          select: {
            name: true,
            indexTask: {
              select: {
                name: true,
                workArea: {
                  select: {
                    name: true,
                    project: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        users: {
          select: {
            user: {
              select: {
                id: true,
                role: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return getTask;
  }

  static async find(id: WorkAreas['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findWorkArea = await prisma.workAreas.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        indexTasks: {
          orderBy: { id: 'asc' },
          select: {
            id: true,
            name: true,
            tasks: {
              orderBy: { id: 'asc' },
              select: {
                id: true,
                name: true,
                _count: { select: { subTasks: true } },
              },
            },
          },
        },
      },
    });
    if (!findWorkArea) throw new AppError('Could not found user ', 404);
    return findWorkArea;
  }

  static async create({
    name,
    projectId,
  }: WorkAreas & { projectId: Projects['id'] }) {
    const createWorkArea = await prisma.workAreas.create({
      data: {
        name,
        project: {
          connect: {
            id: projectId,
          },
        },
      },
    });
    return createWorkArea;
  }

  static async update(
    id: WorkAreas['id'],
    { name, projectId, userId }: WorkAreas & { userId: Users['id'] }
  ) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateWorkArea = await prisma.workAreas.update({
      where: { id },
      data: {
        name,
        project: {
          connect: {
            id: projectId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return updateWorkArea;
  }

  static async delete(id: WorkAreas['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const deleteWorkArea = await prisma.workAreas.delete({
      where: { id },
    });
    return deleteWorkArea;
  }
}

export default WorkAreasServices;
