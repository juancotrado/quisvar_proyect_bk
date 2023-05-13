import { Projects, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

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
        tasks: { select: { subtasks: true } },
      },
    });
    if (!findProject) throw new AppError('Could not found user ', 404);
    return findProject;
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
