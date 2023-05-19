import { Tasks, WorkAreas, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

class WorkAreasServices {
  static async getAll() {
    try {
      const getWorkAreas = await prisma.workAreas.findMany({
        include: {
          _count: true,
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
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            startDate: true,
            untilDate: true,
            price: true,
            status: true,
            moderator: {
              select: {
                profile: {
                  select: {
                    userId: true,
                    lastName: true,
                    firstName: true,
                    phone: true,
                  },
                },
              },
            },
            _count: {
              select: {
                tasks: true,
              },
            },
          },
        },
      },
    });
    if (!findWorkArea) throw new AppError('Could not found user ', 404);
    return findWorkArea;
  }

  static async create({ description, name }: WorkAreas) {
    const createWorkArea = await prisma.workAreas.create({
      data: { description, name },
    });
    return createWorkArea;
  }

  static async update(id: WorkAreas['id'], { name, description }: WorkAreas) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateWorkArea = await prisma.workAreas.update({
      where: { id },
      data: {
        name,
        description,
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
