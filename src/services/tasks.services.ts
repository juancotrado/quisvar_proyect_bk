import { prisma } from '../utils/prisma.server';

class tasksServices {
  static async getTask() {
    try {
      const task = await prisma.tasks.findMany();
      return task;
    } catch (error) {
      throw error;
    }
  }
}
export default tasksServices;
