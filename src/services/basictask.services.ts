import { BasicTasks, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

class BasicTasksServices {
  public static async find(id: BasicTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findSubTask = await prisma.basicTasks.findUnique({
      where: { id },
      // include: Queries.includeBasictask,
    });
    if (!findSubTask) throw new AppError('No se pudo encontrar la tares ', 404);
    return findSubTask;
  }

  public static async create({ name, days, levels_Id }: BasicTasks) {
    const isDuplicated = await this.findDuplicate(name, levels_Id, 'ROOT');
    const { duplicated, quantity, typeItem } = isDuplicated;
    if (duplicated) throw new AppError('Error, Nombre existente', 404);
    const data = { name, days, levels_Id, index: quantity + 1, typeItem };
    const newTask = await prisma.basicTasks.create({
      data,
      // include: { users: { select: { user: Queries.selectProfileUser } } },
    });
    return newTask;
  }

  public static async addToUpperorLower(
    id: BasicTasks['id'],
    { name, days }: BasicTasks,
    typeGte: 'upper' | 'lower'
  ) {
    if (!id || !typeGte) throw new AppError('Oops!,ID invalido', 400);
    //--------------------------- Find basictask ------------------------------------
    const findLevel = await prisma.basicTasks.findUnique({ where: { id } });
    if (!findLevel)
      throw new AppError('No se pudieron encontrar el nivel', 404);
    const { index: _index, levels_Id, typeItem } = findLevel;

    const index = typeGte === 'upper' ? { gte: _index } : { gt: _index };
    const filterTaskList = await prisma.basicTasks.groupBy({
      by: ['id', 'index'],
      where: { levels_Id, index },
      orderBy: { index: 'asc' },
    });
    const parseIndex = typeGte === 'upper' ? _index : _index + 1;
    const data = { levels_Id, name, days, index: parseIndex, typeItem };
    const newLevel = await prisma.basicTasks.create({ data });
    const updateLevels = await this.listByUpdate(filterTaskList, 1);
    return { newLevel, updateLevels };
  }

  public static async update(
    id: BasicTasks['id'],
    { days, name }: Pick<BasicTasks, 'days' | 'name'>
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateTask = await prisma.basicTasks.update({
      where: { id },
      data: { days, name },
      // include: {
      //   users: { select: { user: Queries.selectProfileUser } },
      // },
    });
    return updateTask;
  }

  public static async delete(id: BasicTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const subTaskDelete = await prisma.basicTasks.findUnique({
      where: { id },
      select: { levels_Id: true },
    });
    if (!subTaskDelete) throw new AppError('Oops!,ID invalido', 400);
    const filterTaskList = await prisma.basicTasks.groupBy({
      by: ['id', 'index'],
      where: { levels_Id: subTaskDelete.levels_Id },
      orderBy: { index: 'asc' },
    });

    const updateList = await this.listByUpdate(filterTaskList, 0);
    return { subTaskDelete, updateList };
  }

  public static async updateStatus(
    subtaskId: BasicTasks['id'],
    { status }: { status: BasicTasks['status'] | 'REMOVEALL' }
  ) {}

  public static async updateStatusByUser(
    subtaskId: BasicTasks['id'],
    { id: userId }: { id: number },
    { status }: { status: BasicTasks['status'] | 'REMOVEALL' }
  ) {
    if (!subtaskId) throw new AppError('Oops!,ID invalido', 400);
    const findTask = await this.find(subtaskId);
    // const updateTaskStatus = await prisma.basicTasks.update({
    //   where: { id: subtaskId },
    //   data: { status },
    //   // include: Queries.includeSubtask,
    // });
    const subtaskId_userId = { subtaskId, userId };
    const users =
      (status === 'UNRESOLVED' && { delete: { subtaskId_userId } }) ||
      (status === 'PROCESS' && { create: { userId } }) ||
      (status === 'REMOVEALL' && { deleteMany: { subtaskId } }) ||
      undefined;

    // await prisma.subTasks.update({
    //   where: { id: subtaskId },
    //   data: { users },
    // });
    return { findTask, users };
  }

  public static async findDuplicate(
    name: string,
    id: number,
    type: 'ROOT' | 'ID'
  ) {
    let levels_Id = id;
    if (type === 'ID') {
      const getLevelId = await prisma.basicTasks.findUnique({ where: { id } });
      if (!getLevelId) throw new AppError('No existe encontrar el índice', 404);
      levels_Id = getLevelId.levels_Id;
    }
    const findLevel = await prisma.basicLevels.findUnique({
      where: { id: levels_Id },
      select: {
        typeItem: true,
        subTasks: { select: { name: true } },
      },
    });
    if (!findLevel) throw new AppError('No se pudo encontrar el índice', 404);
    const { subTasks, typeItem } = findLevel;
    const quantity = subTasks.length;
    const duplicated = subTasks.some(task => task.name === name);
    return { duplicated, quantity, levels_Id, typeItem };
  }

  public static async listByUpdate(
    list: { id: number; index: number }[],
    quantity: number = -1
  ) {
    const updateListPerLevel = list.map(({ id, index }) => {
      const data = { index: index + quantity };
      const update = prisma.basicTasks.update({ where: { id }, data });
      return update;
    });
    return prisma.$transaction(updateListPerLevel);
  }
}
export default BasicTasksServices;
