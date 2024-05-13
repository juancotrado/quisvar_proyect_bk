import AppError from '../utils/appError';
import { Projects, Stages, SubTasks, prisma } from '../utils/prisma.server';
import {
  calculateAndUpdateDataByLevel,
  round2Decimal,
  sumPriceByStage,
  sumValues,
} from '../utils/tools';
import LevelsServices from './levels.services';
import { existsSync } from 'fs';
import Queries from '../utils/queries';
import PathServices from './paths.services';
import { ListCostType, StageUpdate, TypeCost, usersCount } from 'types/types';

class StageServices {
  public static estadia = 1000;
  public static async findMany(projectId: Projects['id']) {
    const findStages = await prisma.stages.findMany({
      where: { projectId },
      select: { id: true, name: true },
    });
    return findStages;
  }

  public static async findShort(id: Stages['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const findStage = await prisma.stages.findUnique({ where: { id } });
    if (!findStage) throw new AppError('Oops!, ID invalido', 400);
    return findStage;
  }

  public static async findDetails(id: Stages['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const findStage = await prisma.stages.findUnique({
      where: { id },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            // moderator: Queries.selectProfileUserForStage,
            groups: {
              where: { users: { status: true } },
              select: { users: Queries.selectProfileUserForStage },
            },
          },
        },
        project: {
          select: {
            contract: Queries.selectContractStage,
          },
        },
      },
    });
    if (!findStage)
      throw new AppError('Oops!, No se pudo encontrar la etapa', 400);
    return findStage;
  }

  public static async find(
    id: Stages['id'],
    status?: SubTasks['status'],
    typeCost?: TypeCost
  ) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const findStage = await prisma.stages.findUnique({
      where: { id },
      include: {
        group: { select: { id: true } },
        project: { select: { name: true } },
      },
    });
    if (!findStage)
      throw new AppError('Oops!,No se pudo encontrar la etapa', 400);
    const {
      name,
      project,
      rootTypeItem,
      isProject,
      bachelorCost,
      professionalCost,
      graduateCost,
      internCost,
    } = findStage;
    const projectName = project.name;
    const getList = await prisma.levels.findMany({
      where: { stagesId: id },
      orderBy: { index: 'asc' },
      include: {
        user: Queries.selectProfileShort,
        subTasks: {
          where: { status },
          orderBy: { index: 'asc' },
          include: {
            users: {
              select: {
                percentage: true,
                userId: true,
                user: Queries.selectProfileUser,
              },
            },
          },
        },
      },
    });
    //------------------------- Value cost per degree ----------------------
    const valueCost = () => {
      const listCost: ListCostType = {
        cost: 0,
        bachelor: round2Decimal(bachelorCost + this.estadia),
        professional: round2Decimal(professionalCost + this.estadia),
        graduate: round2Decimal(professionalCost + this.estadia),
        intern: round2Decimal(professionalCost + this.estadia),
      };
      if (typeCost === 'bachelor')
        return {
          ...listCost,
          cost: round2Decimal(bachelorCost + this.estadia),
        };
      if (typeCost === 'professional')
        return {
          ...listCost,
          cost: round2Decimal(professionalCost + this.estadia),
        };
      if (typeCost === 'graduate')
        return {
          ...listCost,
          cost: round2Decimal(graduateCost + this.estadia),
        };
      if (typeCost === 'intern')
        return {
          ...listCost,
          cost: round2Decimal(internCost + this.estadia),
        };
      return { ...listCost, cost: undefined };
    };
    //--------------------------------------------------------------------
    const list = LevelsServices.findList(getList, 0, 0, valueCost());
    const nextLevel = calculateAndUpdateDataByLevel(list);
    const total = sumValues(nextLevel, 'total');
    const balance = sumValues(nextLevel, 'balance');
    const price = sumValues(nextLevel, 'price');
    const spending = sumValues(nextLevel, 'spending');
    const _percentage = sumValues(nextLevel, 'percentage') / nextLevel.length;
    const lists = nextLevel.map(l => l.listUsers).flat(2);
    const listUsers: usersCount[] = lists.reduce(
      (acc: typeof list, { count, userId, ...data }) => {
        const exist = acc.findIndex(u => u.userId === userId);
        exist > 0
          ? (acc[exist].count += count)
          : acc.push({ userId, count, ...data });
        return acc;
      },
      []
    );
    const percentage = Math.round(_percentage * 100) / 100;
    const totalValues = sumPriceByStage(getList);
    return {
      id,
      name,
      projectName,
      percentage,
      total,
      isProject,
      rootTypeItem,
      ...totalValues,
      balance,
      price,
      listUsers,
      spending,
      nextLevel,
    };
  }

  static async findReport(id: Projects['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findStage = await prisma.stages.findUnique({
      where: { id },
      select: {
        group: {
          select: {
            id: true,
          },
        },
        project: {
          select: {
            contract: {
              select: {
                cui: true,
                projectName: true,
                district: true,
                department: true,
                province: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
    if (!findStage)
      throw new AppError('No se pudo encontrar el informe .', 404);
    const mod = await prisma.groupOnUsers.findFirst({
      where: { groupId: findStage.group?.id, mod: true },
      select: {
        users: Queries.selectProfileUserForStage,
      },
    });
    const { project } = findStage;
    const { createdAt, cui, department, district, projectName, province } =
      project.contract;
    let moderatorName = 'Aun no asignado';
    if (mod && mod.users && mod.users.profile) {
      const { firstName, lastName } = mod.users.profile;
      moderatorName = `${firstName} ${lastName}`;
    }
    return {
      initialDate: createdAt,
      cui,
      department,
      district,
      projectName,
      province,
      moderatorName,
      finishDate: '-',
    };
  }

  static async duplicate(id: number, name: string, type: 'ID' | 'ROOT') {
    let projectId: number = id;
    if (name.includes('projects')) throw new AppError('Nombre reservado', 404);
    if (type === 'ID') {
      const project = await prisma.stages.findUnique({ where: { id } });
      if (!project) throw new AppError('Etapa no Encontrada', 404);
      projectId = project.projectId;
    }
    const getStages = await prisma.stages.groupBy({
      by: ['name'],
      where: { projectId },
    });
    const list = getStages.map(({ name }) => name);
    return list.includes(name);
  }

  static async create({ name, projectId }: Stages) {
    const duplicated = await this.duplicate(projectId, name, 'ROOT');
    if (duplicated) throw new AppError('Ops!,Nombre repetido', 400);
    const path = await PathServices.project(projectId, 'UPLOADS');
    if (!existsSync(path)) throw new AppError('Ops!,carpeta no existe', 404);
    const createStage = await prisma.stages.create({
      data: { name, projectId },
      include: { project: { select: { name: true, id: true } } },
    });
    return createStage;
  }

  static async update(id: Stages['id'], { name }: Stages) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const duplicated = await this.duplicate(id, name, 'ID');
    if (duplicated) throw new AppError('Ops!,Nombre repetido', 400);
    const path = await PathServices.stage(id, 'UPLOADS');
    if (!existsSync(path)) throw new AppError('Ops!,carpeta no existe', 404);
    const updateStage = await prisma.stages.update({
      where: { id },
      data: { name },
      include: { project: { select: { name: true } } },
    });
    return updateStage;
  }

  static async updateDetails(
    id: Stages['id'],
    { groupId, ...data }: StageUpdate
  ) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const findGroup = await prisma.stages.findUnique({
      where: { id },
      select: { groupId: true },
    });
    if (groupId && groupId !== findGroup?.groupId) {
      const quantityUsers = await prisma.taskOnUsers.count({
        where: { subtask: { Levels: { stages: { id } } } },
      });
      if (quantityUsers > 0)
        throw new AppError('El grupo, tiene tareas asignadas', 400);
    }
    // const duplicated = await this.duplicate(id, name, 'ID');
    // if (duplicated) throw new AppError('Ops!,Nombre repetido', 400);
    // const path = await PathServices.stage(id, 'UPLOADS');
    // if (!existsSync(path)) throw new AppError('Ops!,carpeta no existe', 404);
    const updateStage = await prisma.stages.update({
      where: { id },
      data: { ...data, groupId },
      include: { project: { select: { name: true } } },
    });
    return updateStage;
  }

  static async delete(id: Stages['id']) {
    if (!id) throw new AppError('Oops!, ID invalido', 400);
    const path = await PathServices.stage(id, 'UPLOADS');
    if (!existsSync(path)) throw new AppError('Ops!,carpeta no existe', 404);
    const deleteStage = await prisma.stages.delete({
      where: { id },
      include: { project: { select: { name: true, id: true } } },
    });
    return deleteStage;
  }
}
export default StageServices;
