import { SubTasks, Users, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import fs, { copyFileSync, renameSync } from 'fs';
import PathServices from './paths.services';
import Queries from '../utils/queries';
import { copyFile } from 'fs/promises';
import { getRootItem } from '../utils/tools';
class SubTasksServices {
  static GMT = 60 * 60 * 1000;
  static today = new Date().getTime();

  static async find(id: SubTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findSubTask = await prisma.subTasks.findUnique({
      where: { id },
      include: Queries.includeSubtask,
    });
    if (!findSubTask) throw new AppError('No se pudo encontrar la tares ', 404);
    return findSubTask;
  }

  static async findMany() {
    const findSubTasks = await prisma.subTasks.findMany({
      include: {
        ...Queries.includeSubtask,
      },
    });
    if (!findSubTasks) throw new AppError('No Hay ninguna tarea', 404);
    return findSubTasks;
  }

  static async findDuplicate(name: string, id: number, type: 'ROOT' | 'ID') {
    let levels_Id, rootItem;
    levels_Id = id;
    if (name.includes('projects'))
      throw new AppError('Error palabra reservada', 404);
    if (type === 'ID') {
      const getLevelId = await prisma.subTasks.findUnique({
        where: { id },
        select: { levels_Id: true, item: true },
      });
      if (!getLevelId)
        throw new AppError('No se pudo encontrar el índice de nivel', 404);
      levels_Id = getLevelId.levels_Id;
      rootItem = getLevelId.item;
    }
    const findLevel = await prisma.levels.findUnique({
      where: { id: levels_Id },
      select: { item: true, subTasks: { select: { name: true } } },
    });
    if (!findLevel) throw new AppError('No se pudo encontrar el índice', 404);
    const { subTasks } = findLevel;
    rootItem = findLevel.item;
    const quantity = subTasks.length;
    const duplicated = subTasks.map(({ name }) => name).includes(name);
    return { duplicated, quantity, levels_Id, rootItem };
  }

  static async create({ name, price, description, days, levels_Id }: SubTasks) {
    const isDuplicated = await this.findDuplicate(name, levels_Id, 'ROOT');
    const { duplicated, rootItem, quantity } = isDuplicated;
    if (duplicated) throw new AppError('Error, Nombre existente', 404);
    //--------------------------------------------------------------------------
    const item = rootItem + '.' + (quantity + 1);
    const data = { name, price, days, description, levels_Id, item };
    const newSubTask = await prisma.subTasks.create({
      data,
      include: { users: { select: { user: Queries.selectProfileUser } } },
    });
    return newSubTask;
  }
  static async assigned(
    subtaskId: SubTasks['id'],
    userId: Users['id'],
    option: 'decline' | 'apply' | 'review'
  ) {
    if (option == 'decline') {
      const status = 'UNRESOLVED';
      return await prisma.subTasks.update({
        where: { id: subtaskId },
        data: { status, users: { deleteMany: { subtaskId } } },
        include: Queries.includeSubtask,
      });
    }
    if (option == 'apply') {
      const status = 'PROCESS';
      const { days } = await this.find(subtaskId);
      const hours = days * this.GMT;
      const untilDate = new Date(this.today + hours);
      return await prisma.subTasks.update({
        where: { id: subtaskId },
        data: {
          status,
          users: { create: { userId, untilDate } },
        },
        include: Queries.includeSubtask,
      });
    }
    if (option == 'review') {
      return prisma.subTasks.update({
        where: { id: subtaskId },
        data: { status: 'INREVIEW' },
        include: Queries.includeSubtask,
      });
    }
    throw new AppError('Oops!, Necesitamos un status para esta consulta', 400);
  }
  static async update(
    id: SubTasks['id'],
    {
      days,
      description,
      name,
      price,
    }: Pick<SubTasks, 'name' | 'days' | 'price' | 'description'>
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateTask = await prisma.subTasks.update({
      where: { id },
      data: {
        days,
        description,
        name,
        price,
      },
      include: {
        users: { select: { user: Queries.selectProfileUser } },
      },
    });
    return updateTask;
  }

  // static async updateHasPDF(id: SubTasks['id'], hasPDF: SubTasks['hasPDF']) {
  //   if (!id) throw new AppError('Oops!,ID invalido', 400);
  //   const updateStatusPDF = await prisma.subTasks.update({
  //     where: { id },
  //     data: { hasPDF },
  //     include: Queries.includeSubtask,
  //   });
  //   return updateStatusPDF;
  // }

  static async updateStatus(
    id: SubTasks['id'],
    { status }: SubTasks,
    user: Users
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateTaskStatus = await SubTasksServices.find(id);

    const { item, name } = updateTaskStatus;
    const { lastItem } = getRootItem(item);
    if (status === 'DONE') {
      const path = await PathServices.subTask(id, 'UPLOADS');
      const files = await prisma.files.findMany({
        where: {
          subTasksId: id,
          type: 'REVIEW',
          feedback: { comment: { equals: null } },
        },
      });
      const reviewPath = path.replace('projects', 'reviews');
      const dir = reviewPath.split('/').slice(0, 5).join('/');
      const _files = files.map(async (file, index) => {
        const ext = file.name.split('.').at(-1);
        const _name = item + name + (index + 1) + '.' + ext;
        await prisma.files.update({
          where: { id: file.id },
          data: { type: 'UPLOADS', name: _name, dir },
        });
        renameSync(`${path}/${file.name}`, `${dir}/${_name}`);
      });
      return await Promise.all(_files).then(() => updateTaskStatus);
    }
    if (status === 'PROCESS') {
      if (updateTaskStatus.status === 'INREVIEW')
        return await prisma.subTasks.update({
          where: { id },
          data: { status },
          include: Queries.includeSubtask,
        });
      return await prisma.subTasks.update({
        where: { id },
        data: { users: { create: { userId: user.id } } },
        include: Queries.includeSubtask,
      });
    }
    if (status === 'UNRESOLVED') {
      const subtaskId_userId = { subtaskId: id, userId: user.id };
      return await prisma.subTasks.update({
        where: { id },
        data: { users: { delete: { subtaskId_userId } } },
        include: Queries.includeSubtask,
      });
    }
    if (status === 'LIQUIDATION') {
      return await prisma.subTasks.findUnique({
        where: { id },
        include: Queries.includeSubtask,
      });
    }
    return updateTaskStatus;
  }

  static async delete(id: SubTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const subTask = await prisma.subTasks.findUnique({ where: { id } });
    if (!subTask) throw new AppError(`No se pudo encontrar la subtarea`, 404);
    const list = await prisma.subTasks.findMany({
      where: { levels_Id: subTask.levels_Id, item: { gte: subTask.item } },
      orderBy: { item: 'asc' },
      include: { Levels: { select: { item: true } } },
    });
    const updateList = list.map(async ({ id, Levels }, i) => {
      const item = Levels.item + '.' + (i + 1);
      return await prisma.subTasks.update({ where: { id }, data: { item } });
    });
    const result = await Promise.all(updateList);
    return result;
  }

  static async updatePercentage(
    subtaskId: SubTasks['id'],
    data: { userId: Users['id']; percentage: number }[]
  ) {
    if (!subtaskId) throw new AppError('Opps!, ID invalido', 400);
    const listPercentage = data.map(async ({ percentage, userId }) => {
      if (percentage > 100 || percentage < 0)
        throw new AppError('Ingresar valores desde 0 a 100', 400);
      return await prisma.taskOnUsers.update({
        where: { subtaskId_userId: { subtaskId, userId } },
        data: { percentage },
      });
    });
    const setPercentage = await Promise.all(listPercentage);
    return setPercentage;
  }

  static async assignUserBySubtask(
    userData: { id: number; name: string }[],
    id: SubTasks['id']
  ) {
    const newUserData = userData.map(user => ({ userId: user.id }));
    if (!id) throw new AppError('Oops!,ID invalido', 400);

    const { days } = await this.find(id);
    const hours = days * this.GMT;
    const untilDate = new Date(this.today + hours);
    const assignedUsers = userData.map(async user => {
      return await prisma.subTasks.update({
        where: { id },
        data: {
          status: 'PROCESS',
          users: {
            create: newUserData,
            updateMany: {
              data: { untilDate },
              where: { subtaskId: id, userId: user.id },
            },
          },
        },
        include: Queries.includeSubtask,
      });
    });
    await Promise.all(assignedUsers);
    return assignedUsers[assignedUsers.length - 1];
  }
}
export default SubTasksServices;
