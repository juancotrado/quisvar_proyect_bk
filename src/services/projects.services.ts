import { Projects, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { UpdateProjectPick, projectPick } from '../utils/format.server';
import { PathServices, ReportsServices, _dirPath } from '.';
import Queries from '../utils/queries';
import {
  getDetailsSubtask,
  getQuantityDetail,
  priceTotalArea,
  priceTotalIndexTask,
  sumValues,
} from '../utils/tools';

class ProjectsServices {
  static async getAll() {
    try {
      const getListProjects = await prisma.groupProjects.findMany({
        include: {
          projects: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      // const getProjects = await prisma.projects.findMany({
      //   orderBy: { createdAt: 'desc' },
      // });
      // if (getProjects.length == 0)
      //   throw new AppError('No se pudo encontrar las areas de trabajo', 404);
      return getListProjects;
    } catch (error) {
      throw error;
    }
  }

  static async getByPrice(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findProject = await prisma.projects.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        percentage: true,
        moderator: Queries.selectProfileUser,
        untilDate: true,
        startDate: true,
        district: true,
        department: true,
        province: true,
        areas: {
          orderBy: { item: 'asc' },
          select: {
            user: Queries.selectProfileUser,
            id: true,
            item: true,
            name: true,
            indexTasks: {
              orderBy: { item: 'asc' },
              select: {
                id: true,
                item: true,
                name: true,
                subTasks: Queries.selectSubtaskDetails,
                tasks: {
                  orderBy: { item: 'asc' },
                  select: {
                    id: true,
                    item: true,
                    name: true,
                    subTasks: Queries.selectSubtaskDetails,
                    tasks_2: {
                      orderBy: { item: 'asc' },
                      select: {
                        id: true,
                        item: true,
                        name: true,
                        subTasks: Queries.selectSubtaskDetails,
                        tasks_3: {
                          orderBy: { item: 'asc' },
                          select: {
                            id: true,
                            item: true,
                            name: true,
                            subTasks: Queries.selectSubtaskDetails,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!findProject)
      throw new AppError('Oops!,No se pudo encontrar el proyecto', 404);
    const areas = priceTotalArea(findProject.areas, findProject.percentage);
    const price = sumValues(areas, 'price');
    const spending = sumValues(areas, 'spending');
    const balance = price - spending;
    const taskInfo = getQuantityDetail(areas);
    return { price, spending, balance, taskInfo, ...findProject, areas };
  }
  static async find(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findProject = await prisma.projects.findUnique({
      where: {
        id,
      },
      include: {
        moderator: {
          select: {
            profile: true,
          },
        },
        areas: {
          orderBy: {
            name: 'asc',
          },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!findProject)
      throw new AppError('No se pudo encontrar los proyectos registrados', 404);
    return findProject;
  }
  static async findShort(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findProject = await prisma.projects.findUnique({
      where: { id },
    });
    if (!findProject)
      throw new AppError('No se pudo encontrar los proyectos registrados', 404);
    return findProject;
  }
  static async create({
    name,
    description,
    untilDate,
    userId,
    startDate,
    unique,
    stageId,
    CUI,
    department,
    district,
    province,
    specialistsInfo,
    companyInfo,
    percentage,
    consortiumInfo,
    typeSpecialityId,
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
    const newProject = await prisma.projects.create({
      data: {
        name,
        description,
        startDate,
        unique,
        untilDate,
        CUI,
        userId,

        department,
        district,
        province,
        specialists,
        company,
        consortium,
        typeSpecialityId,
        percentage,
      },
    });
    if (newProject) {
      await prisma.projects.update({
        where: { id: newProject.id },
        data: { group: { create: { name: newProject.name } } },
      });
    }
    if (newProject.unique) {
      const area = await prisma.workAreas.create({
        data: {
          name,
          item: '0',
          project: {
            connect: { id: newProject.id },
          },
        },
      });
      return { ...newProject, workAreaId: area.id };
    }
    return { ...newProject, workAreaId: 0 };
  }

  static async update(
    id: Projects['id'],
    {
      name,
      description,
      startDate,
      stageId,
      untilDate,
      status,
      userId,
      CUI,
      department,
      province,
      district,
      specialistsInfo,
      companyInfo,
      consortiumInfo,
      percentage,
      typeSpecialityId,
    }: UpdateProjectPick
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const getNameProject = await prisma.projects.findUnique({
      where: { id },
      select: { name: true },
    });
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
    if (!getNameProject)
      throw new AppError('Oops!,No se pudo encontrar el projecto', 400);
    const updateProject = await prisma.projects.update({
      where: { id },
      data: {
        name,
        description,
        startDate,
        untilDate,
        CUI,
        status,
        department,
        district,
        province,
        specialists,
        company,
        consortium,
        percentage,

        moderator: {
          connect: { id: userId },
        },
        group: { update: { name } },
      },
    });
    if (getNameProject.name !== updateProject.name) {
      const listSubtaks = await ReportsServices.getSubTasksByProyect(id);
      listSubtaks.forEach(async subtask => {
        const { files } = subtask;
        const model = files.filter(file => file.type === 'MATERIAL');
        const review = files.filter(file => file.type === 'REVIEW');
        const uploads = files.filter(file => file.type === 'SUCCESSFUL');
        if (model.length !== 0) {
          const dir = await PathServices.pathSubTask(subtask.id, 'MATERIAL');
          await prisma.files.updateMany({
            where: { subTasks: { id: subtask.id }, type: 'MATERIAL' },
            data: { dir },
          });
        }
        if (review.length !== 0) {
          const dir = await PathServices.pathSubTask(subtask.id, 'REVIEW');
          await prisma.files.updateMany({
            where: { subTasks: { id: subtask.id }, type: 'REVIEW' },
            data: { dir },
          });
        }
        if (uploads.length !== 0) {
          const dir = await PathServices.pathSubTask(subtask.id, 'SUCCESSFUL');
          await prisma.files.updateMany({
            where: { subTasks: { id: subtask.id }, type: 'SUCCESSFUL' },
            data: { dir },
          });
        }
      });
    }
    return updateProject;
  }

  static async delete(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const { unique, groupId } = await this.findShort(id);
    if (unique) {
      await prisma.workAreas.deleteMany({
        where: { projectId: id },
      });
    }
    const deleteProject = await prisma.projects.delete({
      where: { id },
    });
    const countProjects = await prisma.projects.count({ where: { groupId } });
    if (groupId && countProjects == 0) {
      await prisma.groupProjects.delete({ where: { id: groupId } });
    }
    return deleteProject;
  }
}
export default ProjectsServices;
