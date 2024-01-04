import { Projects, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { UpdateProjectPick, projectPick } from '../utils/format.server';
import { PathServices } from '.';
import Queries from '../utils/queries';
import { existsSync } from 'fs';

class ProjectsServices {
  static async getAll() {
    const getListProjects = await prisma.projects.findMany({
      orderBy: { id: 'asc' },
    });
    return getListProjects;
  }

  static async find(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findProject = await prisma.projects.findUnique({
      where: { id },
      include: {
        moderator: Queries.selectProfileUser,
        stages: true,
      },
    });
    if (!findProject)
      throw new AppError('No se pudo encontrar los proyectos registrados', 404);
    return findProject;
  }

  static async create({ name, typeSpecialityId, contractId }: projectPick) {
    const newProject = await prisma.projects.create({
      data: {
        name,
        typeSpecialityId,
        contract: { connect: { id: contractId } },
      },
    });
    return newProject;
  }

  static async update(
    id: Projects['id'],
    { contractId, ...data }: UpdateProjectPick
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateProject = await prisma.projects.update({
      where: { id },
      data: { ...data, contract: { update: { id: contractId } } },
    });
    return updateProject;
  }

  static async delete(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const path = await PathServices.project(id, 'UPLOADS');
    if (!existsSync(path))
      throw new AppError('No se pudo eliminar el projecto', 400);
    const deleteProject = await prisma.projects.delete({ where: { id } });
    return { ...deleteProject, path };
  }
}
export default ProjectsServices;
