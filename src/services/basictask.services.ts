import { BasicTasks } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { numberToConvert } from '../utils/tools';
import Queries from '../utils/queries';
import { unlinkSync } from 'fs';

class BasicTasksServices {
  public static async find(id: BasicTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findSubTask = await prisma.basicTasks.findUnique({
      where: { id },
      include: Queries.includeBasictask,
    });
    if (!findSubTask) throw new AppError('No se pudo encontrar la tares ', 404);
    const {
      Levels,
      files: listFiles,
      users: listUsers,
      feedBacks,
      ...task
    } = findSubTask;
    const managerGroup = Levels.stages.group?.groups[0];
    const users = listUsers.reduce<Record<string, typeof listUsers>>(
      (acc, user) => {
        const { status } = user;
        const type = status ? 'ACTIVE' : 'INACTIVE';
        if (!acc[type]) acc[type] = [];
        acc[type].push(user);
        return acc;
      },
      {}
    );
    const files = listFiles.reduce<Record<string, typeof listFiles>>(
      (acc, file) => {
        const { type } = file;
        if (!acc[type]) acc[type] = [];
        acc[type].push(file);
        return acc;
      },
      {}
    );
    const lastFeedback = feedBacks[0];
    const { item } = await this.getItem([...Levels.levelList, Levels.id]);
    return { item, managerGroup, ...task, lastFeedback, users, files };
  }

  public static async create({ name, days, levels_Id }: BasicTasks) {
    const isDuplicated = await this.findDuplicate(name, levels_Id, 'ROOT');
    const { duplicated, quantity, typeItem } = isDuplicated;
    if (duplicated) throw new AppError('Error, Nombre existente', 404);
    const data = { name, days, levels_Id, index: quantity + 1, typeItem };
    const newTask = await prisma.basicTasks.create({ data });
    return newTask;
  }

  public static async update(
    id: BasicTasks['id'],
    { days, name }: Pick<BasicTasks, 'days' | 'name'>
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateTask = await prisma.basicTasks.update({
      where: { id },
      data: { days, name },
    });
    return updateTask;
  }

  public static async updateStatus(
    id: BasicTasks['id'],
    status: BasicTasks['status']
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    if (status === 'REVIEWED') {
      const updateTask = await prisma.basicTasks.update({
        where: { id },
        data: { status },
      });
    }
    // if(status === "")
  }

  public static async sort(list: { id: number; index: number }[]) {
    const sortingList = list.map(({ id, index }) => {
      return prisma.basicTasks.update({ where: { id }, data: { index } });
    });
    return await prisma.$transaction(sortingList);
  }

  public static async delete(id: BasicTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const subTaskDelete = await prisma.basicTasks.delete({
      where: { id },
      select: { index: true, levels_Id: true },
    });
    if (!subTaskDelete) throw new AppError('Oops!,ID invalido', 400);
    const filterTaskList = await prisma.basicTasks.groupBy({
      by: ['id', 'index'],
      where: {
        levels_Id: subTaskDelete.levels_Id,
        index: { gt: subTaskDelete.index },
      },
      orderBy: { index: 'asc' },
    });
    const updateList = await this.listByUpdate(filterTaskList);
    return { subTaskDelete, updateList };
  }

  public static async restore(id: BasicTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const restoreQuery = await prisma.basicTasks.update({
      where: { id },
      data: {
        status: 'UNRESOLVED',
        files: { deleteMany: { subTasksId: id } },
        feedBacks: { deleteMany: { subTasksId: id } },
        users: { deleteMany: { taskId: id } },
      },
      select: { name: true, id: true, files: true },
    });
    restoreQuery.files.forEach(file => {
      const path = file.dir + '/' + file.name;
      unlinkSync(path);
    });
    return restoreQuery;
  }

  public static async addToUpperorLower(
    id: BasicTasks['id'],
    { name, days }: Pick<BasicTasks, 'days' | 'name'>,
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

  private static async getItem(list: number[]) {
    const getLevels = await prisma.basicLevels.findMany({
      where: { id: { in: list } },
      orderBy: { level: 'asc' },
      select: { index: true, typeItem: true },
    });
    let item: string = '';
    getLevels.forEach(({ typeItem, index }) => {
      item = item + numberToConvert(index, typeItem) + '.';
    });
    return { item };
  }
}
export default BasicTasksServices;
