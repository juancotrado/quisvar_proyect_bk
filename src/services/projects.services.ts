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

  static async find(id: Projects['id'], userId: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findProject = await prisma.projects.findUnique({
      where: { id },
      include: {
        moderator: Queries.selectProfileUser,
        stages: {
          select: {
            id: true,
            name: true,
            group: {
              select: {
                id: true,
                name: true,

                // moderator: Queries.selectProfileUserForStage,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!findProject)
      throw new AppError('No se pudo encontrar los proyectos registrados', 404);
    // const hasAccessInStage = findProject.stages.some(
    //   stage => stage.group?.moderator?.id === userId
    // );
    return { ...findProject, hasAccessInStage: false, useSessionId: userId }; // arregla castillo
  }

  static async create({ name, typeSpecialityId, contractId }: projectPick) {
    const newProject = await prisma.projects.create({
      data: {
        name,
        typeSpecialityId,
        contractId,
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
      data: { ...data, contractId },
    });
    await prisma.contratc.update({
      where: {
        id: updateProject.contractId,
      },
      data: {
        projectShortName: data.name,
      },
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
