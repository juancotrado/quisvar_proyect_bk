import { Tasks, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
class tasksServices {
  static async getTask() {
    try {
      const task = await prisma.tasks.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return task;
    } catch (error) {
      throw error;
    }
  }
  static async delete(id: Tasks['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const deleteUser = await prisma.tasks.delete({
      where: { id },
    });
    return deleteUser;
  }
}
export default tasksServices;
