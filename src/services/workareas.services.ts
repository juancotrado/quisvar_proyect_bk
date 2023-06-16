import {
  Projects,
  SubTasks,
  Tasks,
  Users,
  WorkAreas,
  prisma,
} from '../utils/prisma.server';
import AppError from '../utils/appError';
import { renameDir } from '../utils/fileSystem';
import PathServices from './paths.services';
class WorkAreasServices {
  static async getAll() {
    try {
      const getWorkAreas = await prisma.workAreas.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          user: {
            select: {
              _count: true,
            },
          },
        },
      });
      if (getWorkAreas.length == 0)
        throw new AppError('Could not found work areas', 404);
      return getWorkAreas;
    } catch (error) {
      throw error;
    }
  }

  static async getReviewfromUser(userId: Users['id']) {
    const getTask = await prisma.subTasks.findMany({
      where: {
        status: 'INREVIEW',
        AND: [
          { task: { indexTask: { workArea: { userId } } } },
          { indexTask: { workArea: { userId } } },
        ],
      },
      select: {
        id: true,
        name: true,
        item: true,
        indexTask: {
          select: {
            name: true,
            item: true,
            workArea: {
              select: {
                name: true,
                item: true,
              },
            },
          },
        },
        task: {
          select: {
            name: true,
            item: true,
            indexTask: {
              select: {
                name: true,
                item: true,
                workArea: {
                  select: {
                    name: true,
                    item: true,
                  },
                },
              },
            },
          },
        },
        users: {
          select: {
            user: {
              select: {
                id: true,
                role: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return getTask;
  }

  static async find(id: WorkAreas['id']) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const findWorkArea = await prisma.workAreas.findUnique({
      where: {
        id,
      },
      include: {
        project: { select: { name: true } },
        user: {
          include: {
            profile: true,
          },
        },
        indexTasks: {
          orderBy: { id: 'asc' },
          select: {
            id: true,
            name: true,
            unique: true,
            item: true,
            tasks: {
              orderBy: { id: 'asc' },
              select: {
                id: true,
                name: true,
                item: true,
                _count: { select: { subTasks: true } },
              },
            },
          },
        },
      },
    });
    if (!findWorkArea) throw new AppError('Could not found user ', 404);
    return findWorkArea;
  }

  static async create({
    name,
    projectId,
  }: WorkAreas & { projectId: Projects['id'] }) {
    const getIndex = await prisma.workAreas.count({ where: { projectId } });
    const createWorkArea = await prisma.workAreas.create({
      data: {
        name,
        item: `${getIndex + 1}`,
        project: {
          connect: {
            id: projectId,
          },
        },
      },
    });
    return createWorkArea;
  }

  static async update(
    id: WorkAreas['id'],
    { name, userId }: WorkAreas & { userId: Users['id'] }
  ) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const updateWorkArea = await prisma.workAreas.update({
      where: { id },
      data: {
        name,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return updateWorkArea;
  }

  static async delete(id: WorkAreas['id'], projectId: number) {
    if (!id) throw new AppError('Oops!,Invalid ID', 400);
    const dirProject = await PathServices.pathProject(projectId);
    const deleteWorkArea = await prisma.workAreas.delete({
      where: { id },
    });
    const getProjects = await prisma.workAreas.findMany({
      where: { projectId },
      orderBy: { id: 'asc' },
    });
    getProjects.forEach(async (project, index) => {
      const _project = await prisma.workAreas.update({
        where: { id: project.id },
        data: { item: `${index + 1}` },
      });
      const oldDir = dirProject + '/' + project.item + '.' + project.name;
      const newDir = dirProject + '/' + _project.item + '.' + project.name;
      renameDir(oldDir, newDir);
    });
    return deleteWorkArea;
  }
}

export default WorkAreasServices;
