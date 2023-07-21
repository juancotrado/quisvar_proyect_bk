import {
  Projects,
  Specialities,
  Stages,
  Users,
  prisma,
} from '../utils/prisma.server';
import AppError from '../utils/appError';
import {
  PersonBussinessType,
  UpdateProjectPick,
  projectPick,
} from '../utils/format.server';
import { PathServices, ReportsServices, _dirPath } from '.';

class ProjectsServices {
  static async getAll() {
    try {
      const getListProjects = await prisma.groupProjects.findMany({
        include: {
          projects: {
            orderBy: { createdAt: 'desc' },
            include: { stage: true },
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
      include: { stage: { select: { id: true, name: true } } },
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
    typeSpeciality,
    unique,
    specialityId,
    stageId,
    CUI,
    department,
    district,
    province,
    listSpecialists,
  }: projectPick) {
    const specialists = listSpecialists
      ? { createMany: { data: listSpecialists } }
      : {};
    const newProject = await prisma.projects.create({
      data: {
        name,
        description,
        startDate,
        unique,
        untilDate,
        typeSpeciality,
        CUI,
        specialityId,
        userId,
        stageId,
        department,
        district,
        province,
        specialists,
        // company: { create: { manager: '', name: '', ruc: '' } },
        // consortium: {
        //   create: {
        //     manager: '',
        //     name: '',
        //     companies: {
        //       createMany: {
        //         data: [
        //           { manager: '', name: '', ruc: '', percentage: 0 },
        //           { manager: '', name: '', ruc: '', percentage: 0 },
        //           { manager: '', name: '', ruc: '', percentage: 0 },
        //         ],
        //       },
        //     },
        //   },
        // },
      },
      include: {
        stage: {
          select: { id: true, name: true },
        },
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
      typeSpeciality,
      stageId,
      untilDate,
      status,
      userId,
      CUI,
      department,
      province,
      district,
      listSpecialists,
    }: UpdateProjectPick
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const getNameProject = await prisma.projects.findUnique({
      where: { id },
      select: { name: true },
    });
    if (!getNameProject)
      throw new AppError('Oops!,No se pudo encontrar el projecto', 400);
    const updateProject = await prisma.projects.update({
      where: { id },
      data: {
        name,
        description,
        startDate,
        untilDate,
        typeSpeciality,
        CUI,
        status,
        department,
        district,
        province,
        specialists: {
          deleteMany: { projectsId: id },
          createMany: { data: listSpecialists },
        },
        stage: { connect: { id: stageId } },
        moderator: {
          connect: { id: userId },
        },
        group: { update: { name } },
      },
      include: { stage: { select: { id: true, name: true } } },
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
            where: { subTasks: { id: subtask.id }, type: 'MATERIAL' },
            data: { dir },
          });
        }
        if (uploads.length !== 0) {
          const dir = await PathServices.pathSubTask(subtask.id, 'SUCCESSFUL');
          await prisma.files.updateMany({
            where: { subTasks: { id: subtask.id }, type: 'MATERIAL' },
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
      include: { stage: { select: { id: true, name: true } } },
    });
    const countProjects = await prisma.projects.count({ where: { groupId } });
    if (groupId && countProjects == 0) {
      await prisma.groupProjects.delete({ where: { id: groupId } });
    }
    return deleteProject;
  }
}
export default ProjectsServices;
