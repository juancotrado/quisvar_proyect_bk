/* eslint-disable @typescript-eslint/no-unused-vars */
import { SubTasks, Users, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import { copyFileSync, renameSync } from 'fs';
import PathServices from './paths.services';
import Queries from '../utils/queries';
import { getRootItem, numberToConvert } from '../utils/tools';
import { ObjectNumber, UpdateLevelBlock, UpperAddSubtask } from 'types/types';
class SubTasksServices {
  protected static GMT = 60 * 60 * 1000;
  protected static today = new Date().getTime();

  public static async find(id: SubTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findSubTask = await prisma.subTasks.findUnique({
      where: { id },
      include: Queries.includeSubtask,
    });
    if (!findSubTask) throw new AppError('No se pudo encontrar la tares ', 404);
    return findSubTask;
  }

  public static async findMany() {
    const findSubTasks = await prisma.subTasks.findMany({
      include: {
        ...Queries.includeSubtask,
      },
    });
    if (!findSubTasks) throw new AppError('No Hay ninguna tarea', 404);
    return findSubTasks;
  }

  public static async findDuplicate(
    name: string,
    id: number,
    type: 'ROOT' | 'ID'
  ) {
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
      select: {
        item: true,
        typeItem: true,
        subTasks: { select: { name: true } },
      },
    });
    if (!findLevel) throw new AppError('No se pudo encontrar el índice', 404);
    const { subTasks, typeItem } = findLevel;
    rootItem = findLevel.item;
    const quantity = subTasks.length;
    typeItem;
    const duplicated = subTasks.map(({ name }) => name).includes(name);
    return { duplicated, quantity, levels_Id, rootItem, typeItem };
  }

  public static async create({
    name,
    price,
    description,
    days,
    levels_Id,
  }: SubTasks) {
    const isDuplicated = await this.findDuplicate(name, levels_Id, 'ROOT');
    const { duplicated, rootItem, quantity, typeItem } = isDuplicated;
    if (duplicated) throw new AppError('Error, Nombre existente', 404);
    //--------------------------set_new_item---------------------------------------
    const index = quantity + 1;
    const _type = numberToConvert(index, typeItem);
    if (!_type) throw new AppError('excediste Limite de conversion', 400);
    const item = rootItem + _type + '.';
    //--------------------------------------------------------------------------
    const data = { name, price, days, description, levels_Id, item, index };
    const newSubTask = await prisma.subTasks.create({
      data: { ...data, typeItem },
      include: { users: { select: { user: Queries.selectProfileUser } } },
    });
    return newSubTask;
  }
  public static async assigned(
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
      // const findGroup = await prisma.subTasks.findUnique({
      //   where: { id: subtaskId },
      //   select: {
      //     Levels: { select: { stages: { select: { groupId: true } } } },
      //   },
      // });
      // //-------------------------------------------------------------------
      // if (!findGroup?.Levels.stages.groupId)
      //   throw new AppError('Error, asignar grupo primero', 400);
      // //-------------------------------------------------------------------
      const status = 'PROCESS';
      return await prisma.subTasks.update({
        where: { id: subtaskId },
        data: {
          status,
          users: { create: { userId } },
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

  public static async update(
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

  public static async updateStatus(
    id: SubTasks['id'],
    { status, filesId }: SubTasks & { filesId?: number[] },
    user: Users
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findTask = await SubTasksServices.find(id);
    const updateTaskStatus = await prisma.subTasks.update({
      where: { id },
      data: { status },
      include: Queries.includeSubtask,
    });
    const { item, name } = updateTaskStatus;
    const subtaskId_userId = { subtaskId: id, userId: user.id };
    //-------------------------------------------------------------------
    if (findTask.status === 'INREVIEW' && status === 'PROCESS') {
      const lastUser = await prisma.taskOnUsers.findFirst({
        where: { subtaskId: id },
        select: { userId: true },
        orderBy: { assignedAt: 'desc' },
      });
      if (!lastUser) throw new AppError('No se pudo encontrar al usuario', 404);
      const subtaskId_userId = { subtaskId: id, userId: lastUser.userId };
      const patito = await prisma.subTasks.update({
        where: { id },
        data: {
          status,
          users: {
            update: {
              where: { subtaskId_userId },
              data: {
                status: true,
                untilDate: new Date(),
              },
            },
          },
        },
        include: Queries.includeSubtask,
      });
      // console.log(patito);
      return patito;
    }
    //-------------------------------------------------------------------
    if (status === 'PROCESS')
      return await prisma.subTasks.update({
        where: { id },
        data: { users: { create: { userId: user.id } } },
        include: Queries.includeSubtask,
      });
    //-------------------------------------------------------------------
    if (status === 'UNRESOLVED')
      return await prisma.subTasks.update({
        where: { id },
        data: { users: { delete: { subtaskId_userId } } },
        include: Queries.includeSubtask,
      });
    //-------------------------------------------------------------------
    if (status === 'DONE') {
      //--------------------------------paths----------------------------
      const path = await PathServices.subTask(id, 'UPLOADS');
      const reviewPath = path.replace('projects', 'reviews');
      const editablesPath = path.replace('projects', 'editables');
      const dir = reviewPath.split('/').slice(0, 5).join('/');
      //------------------------------------------------------------------
      const filesList = filesId ? filesId : [];
      const files = await prisma.files.findMany({
        where: {
          subTasksId: id,
          type: 'REVIEW',
          id: { in: filesList },
        },
      });
      //-------------------------------------------------------------------
      const countExt = files.reduce((acc: ObjectNumber, value) => {
        const ext = value.name.split('.').at(-1) || '';
        acc[ext] = (acc[ext] || 0) + 1;
        return acc;
      }, {});
      //-------------------------------------------------------------------
      const _files = files.map(async file => {
        const ext = file.name.split('.').at(-1) || '';
        countExt[ext] -= 1;
        const index = countExt[ext] >= 1 ? ` (${countExt[ext]})` : '';
        const _name = item + name + index + '.' + ext;

        await prisma.files.update({
          where: { id: file.id },
          data: { type: 'UPLOADS', name: _name, dir: path },
        });
        //----------------------------------------------------------------
        renameSync(`${dir}/${file.name}`, `${path}/${_name}`);
        if (['pdf', 'PDF'].includes(ext!)) {
          //--------------------------------------------------------------
          // await prisma.files.update({
          //   where: { id: file.id },
          //   data: { type: 'EDITABLES', name: _name, dir: editablesPath },
          // });
          copyFileSync(`${path}/${_name}`, `${editablesPath}/${_name}`);
          //--------------------------------------------------------------
        }
      });
      await Promise.all(_files);
      return SubTasksServices.find(id);
    }
    return updateTaskStatus;
  }

  public static async updateBlock(
    subtasks: UpdateLevelBlock['subTasks'],
    rootItem: string,
    newPath: string,
    newEditable: string,
    previusIndex?: number
  ) {
    const subTasks = await Promise.all(
      subtasks.map(async ({ item: _item, files: _files, ...subtask }, i) => {
        const { lastItem } = getRootItem(_item);
        let index = subtask.index;
        let item = rootItem + lastItem + '.';
        if (previusIndex) {
          index = previusIndex + i;
          const _type = numberToConvert(index, subtask.typeItem) || '';
          item = rootItem + _type + '.';
        }
        const updateSubtask = await prisma.subTasks.update({
          where: { id: subtask.id },
          data: { item, index },
        });
        //------------------------- Count files per task ------------------------------------------
        const countExt = _files.reduce((acc: ObjectNumber, value) => {
          const ext = value.name.split('.').at(-1) || '';
          acc[ext] = (acc[ext] || 0) + 1;
          return acc;
        }, {});
        //-------------------------------------------------------------------
        const parseFiles = await Promise.all(
          _files.map(async ({ dir: d, id: _id, name: n, ...file }) => {
            const { item: _i, name: _n } = updateSubtask;
            const dir = newPath;
            const ext = n.split('.').at(-1) || '';
            countExt[ext] -= 1;
            const index = countExt[ext] >= 1 ? ` (${countExt[ext]})` : '';
            const name = _i + _n + index + '.' + ext;
            await prisma.files
              .update({
                where: { id: _id },
                data: { dir, name },
              })
              .then(() => {
                renameSync(`${newPath}/${n}`, `${newPath}/${name}`);
                if (['.pdf', '.PDF'].includes(ext) && newEditable) {
                  renameSync(`${newEditable}/${n}`, `${newEditable}/${name}`);
                }
              });
            return { dir, name, ...file };
          })
        );
        //-------------------------------------------------------------------------------
        const files = parseFiles.map(f => ({ id: 0, ...f }));
        return { item, files, ...subtask };
      })
    );
    return subTasks;
  }

  public static async addToUper(
    id: SubTasks['id'],
    { name, days, description }: UpperAddSubtask,
    typeGte: 'upper' | 'lower'
  ) {
    if (!id || !typeGte) throw new AppError('Oops!,ID invalido', 400);
    //------------------------------------------------------------------
    const findSubTaskLower = await prisma.subTasks.findUnique({
      where: { id },
      include: { Levels: { select: { item: true, id: true } } },
    });
    if (!findSubTaskLower) throw new AppError('No existe la tarea', 400);
    const { levels_Id, index, Levels, item, typeItem } = findSubTaskLower;

    const data = {
      item,
      name,
      days,
      levels_Id,
      typeItem,
      description,
    };
    //------------------------------------------------------------------
    let newSubTask;
    if (typeGte === 'lower') {
      const { rootItem } = getRootItem(item);
      const newItem = rootItem + '.' + numberToConvert(index + 1, typeItem);
      newSubTask = await prisma.subTasks.create({
        data: { ...data, typeItem, index: index + 1, item: newItem },
        include: { users: { select: { user: Queries.selectProfileUser } } },
      });
    } else {
      newSubTask = await prisma.subTasks.create({
        data: { ...data, typeItem, index },
        include: { users: { select: { user: Queries.selectProfileUser } } },
      });
    }
    const newPath = await PathServices.level(Levels.id);
    const newEditables = newPath.replace('projects', 'editables');
    //------------------------------------------------------------------
    const typeFilter = typeGte === 'upper' ? { gte: index } : { gt: index };
    //------------------------------------------------------------------
    const list = await prisma.subTasks.findMany({
      where: {
        levels_Id,
        index: typeFilter,
        id: {
          not: newSubTask.id,
        },
      },
      orderBy: { index: 'asc' },
      include: {
        files: {
          where: { OR: [{ type: 'UPLOADS' }, { type: 'EDITABLES' }] },
          select: { id: true, dir: true, name: true, type: true },
        },
      },
    });

    const aux = typeGte === 'lower' ? 2 : 1;
    const updateBlock = await this.updateBlock(
      list,
      Levels.item,
      newPath,
      newEditables,
      index + aux
    );
    return [...updateBlock];
  }

  public static async delete(id: SubTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const subTaskDelete = await prisma.subTasks.delete({
      where: { id },
      include: { Levels: { select: { item: true, id: true } } },
    });
    const { levels_Id, index, Levels } = subTaskDelete;
    const newPath = await PathServices.level(Levels.id);
    const newEditables = newPath.replace('projects', 'editables');
    const list = await prisma.subTasks.findMany({
      where: {
        levels_Id,
        index: { gte: index },
      },
      orderBy: { index: 'asc' },
      include: {
        files: {
          where: { OR: [{ type: 'UPLOADS' }, { type: 'EDITABLES' }] },
          select: { id: true, dir: true, name: true, type: true },
        },
      },
    });
    const updateBlock = await this.updateBlock(
      list,
      Levels.item,
      newPath,
      newEditables,
      index
    );
    return { ...subTaskDelete, tasks: updateBlock };
  }

  public static async updatePercentage(
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

  public static async assignUserBySubtask(
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
