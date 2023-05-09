import { WorkAreas, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

class WorkAreasServices {
  static async getAll() {
    try {
      const getWorkAreas = await prisma.workAreas.findMany({
        orderBy: { createdAt: 'asc' },
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
        users: {select:{profile:true}},
      },
    });
    if (!findWorkArea) throw new AppError('Could not found user ', 404);
    return findWorkArea;
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
