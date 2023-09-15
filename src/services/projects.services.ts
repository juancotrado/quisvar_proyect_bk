import { Projects, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { UpdateProjectPick, projectPick } from '../utils/format.server';
import { PathServices, _dirPath } from '.';
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
    stageName,
    consortiumInfo,
    ...otherValues
  }: projectPick) {
    let stages, specialists, company, consortium;
    if (specialistsInfo)
      specialists = { createMany: { data: specialistsInfo } };
    if (companyInfo) company = { create: companyInfo };
    if (consortiumInfo) {
      const { manager, name, companies } = consortiumInfo;
      consortium = {
        create: {
          manager,
          name,
          companies: { createMany: { data: companies } },
        },
      };
    }
    if (stageName) stages = { create: { name: stageName } };
    const data = {
      ...otherValues,
      specialists,
      company,
      consortium,
      stages,
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
    let specialists, company, consortium;
    if (specialistsInfo)
      specialists = {
        deleteMany: { projectsId: id },
        createMany: { data: specialistsInfo },
      };
    if (companyInfo) company = { delete: true, create: companyInfo };
    if (consortiumInfo) {
      const { manager, name, companies } = consortiumInfo;
      consortium = {
        delete: true,
        create: {
          manager,
          name,
          companies: { createMany: { data: companies } },
        },
      };
    }
    const data = { specialists, company, consortium, ...otherValues };
    const updateProject = await prisma.projects.update({
      where: { id },
      data,
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
