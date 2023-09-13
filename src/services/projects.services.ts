import { Projects, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { UpdateProjectPick, projectPick } from '../utils/format.server';
import { PathLevelServices, _dirPath } from '.';
import Queries from '../utils/queries';
import { existsSync } from 'fs';

class ProjectsServices {
  static async getAll() {
    try {
      const getListProjects = await prisma.projects.findMany({
        orderBy: { id: 'asc' },
      });
      return getListProjects;
    } catch (error) {
      throw error;
    }
  }

  static async find(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findProject = await prisma.projects.findUnique({
      where: {
        id,
      },
      include: {
        moderator: Queries.selectProfileUser,
        stages: true,
      },
    });
    if (!findProject)
      throw new AppError('No se pudo encontrar los proyectos registrados', 404);
    return findProject;
  }

  static async create({
    specialistsInfo,
    companyInfo,
    consortiumInfo,
    ...otherValues
  }: projectPick) {
    const specialists = specialistsInfo
      ? { createMany: { data: specialistsInfo } }
      : {};
    const company = companyInfo ? { create: companyInfo } : {};
    const consortium = consortiumInfo
      ? {
          create: {
            manager: consortiumInfo.manager,
            name: consortiumInfo.name,
            companies: {
              createMany: {
                data: consortiumInfo.companies,
              },
            },
          },
        }
      : {};
    const data = {
      ...otherValues,
      specialists,
      company,
      consortium,
    };
    const newProject = await prisma.projects.create({ data });
    return newProject;
  }

  static async update(
    id: Projects['id'],
    {
      specialistsInfo,
      companyInfo,
      consortiumInfo,
      ...otherValues
    }: UpdateProjectPick
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const specialists = specialistsInfo
      ? {
          deleteMany: { projectsId: id },
          createMany: { data: specialistsInfo },
        }
      : {};
    const company = companyInfo
      ? {
          delete: true,
          create: companyInfo,
        }
      : {};
    const consortium = consortiumInfo
      ? {
          delete: true,
          create: {
            manager: consortiumInfo.manager,
            name: consortiumInfo.name,
            companies: {
              createMany: {
                data: consortiumInfo.companies,
              },
            },
          },
        }
      : {};
    const data = { specialists, company, consortium, ...otherValues };
    const updateProject = await prisma.projects.update({
      where: { id },
      data,
    });
    return updateProject;
  }

  static async delete(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const path = await PathLevelServices.pathProject(id, 'UPLOADS');
    if (!existsSync(path))
      throw new AppError('No se pudo eliminar el projecto', 400);
    const deleteProject = await prisma.projects.delete({ where: { id } });
    return { ...deleteProject, path };
  }
}
export default ProjectsServices;
