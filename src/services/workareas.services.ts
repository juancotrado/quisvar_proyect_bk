import { WorkAreas, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
class workareasServices {
  static async getWorkareas() {
    try {
      const workarea = await prisma.workAreas.findMany({
        orderBy: { createdAt: 'asc' },
      });
      return workarea;
    } catch (error) {
      throw error;
    }
  }
  static async delete(id: WorkAreas['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const deleteWorkarea = await prisma.workAreas.delete({
      where: { id },
    });
    return deleteWorkarea;
  }
}
export default workareasServices;
