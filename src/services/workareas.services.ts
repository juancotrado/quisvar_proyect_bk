import {
  Projects,
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

  static async find(id: WorkAreas['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findWorkArea = await prisma.workAreas.findUnique({
      where: {
        id,
      },
      include: {
        indexTasks: {
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            tasks: {
              orderBy: { name: 'asc' },
              select: {
                id: true,
                name: true,
                subTasks: true,
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
    user_id,
    project_id,
  }: WorkAreas & { user_id: Users['id']; project_id: Projects['id'] }) {
    const createWorkArea = await prisma.workAreas.create({
      data: {
        name,
        user: {
          connect: { id: user_id },
        },
        project: {
          connect: {
            id: project_id,
          },
        },
      },
    });
    return createWorkArea;
  }

  static async update(
    id: WorkAreas['id'],
    { name, projectId, userId }: WorkAreas
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
