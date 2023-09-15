import { SubTasks, Users, prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';
import fs, { copyFileSync } from 'fs';
import PathServices from './paths.services';
import Queries from '../utils/queries';
import { copyFile } from 'fs/promises';
class SubTasksServices {
  static async find(id: SubTasks['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findSubTask = await prisma.subTasks.findUnique({
      where: { id },
      include: {
        // ...Queries.includeSubtask,
        // task: {
        // },
      },
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
    if (name.includes('projects'))
      throw new AppError('Error palabra reservada', 404);
    if (type === 'ID') {
      const getLevelId = await prisma.subTasks.findUnique({
        where: { id },
        select: { levels_Id: true, item: true },
      });
      if (!getLevelId)
        throw new AppError('No se pudo encontrar el índice', 404);
      levels_Id = getLevelId.levels_Id;
      rootItem = getLevelId.item;
    }
    const findLevel = await prisma.levels.findUnique({
      where: { id },
      select: { item: true },
    });
    if (!findLevel) throw new AppError('No se pudo encontrar el índice', 404);
    rootItem = findLevel.item;
    const list = await prisma.subTasks.findMany({ where: { levels_Id } });
    const quantity = list.length;
    if (!list) throw new AppError('No se pudo encontrar la lista ', 404);
    const duplicated = list.map(({ name }) => name).includes(name);
    return { duplicated, quantity, levels_Id, rootItem };
  }

  static async create({ name, price, description, days, levels_Id }: SubTasks) {
    const isDuplicated = await this.findDuplicate(name, levels_Id, 'ROOT');
    const { duplicated, rootItem, quantity } = isDuplicated;
    if (duplicated) throw new AppError('Error, Nombre existente', 404);
    const item = rootItem + '.' + (quantity + 1);
    const data = { name, price, days, description, levels_Id, item };
    const newSubTask = await prisma.subTasks.create({
      data,
      include: { users: { select: { user: Queries.selectProfileUser } } },
    });
    return newSubTask;
  }

  static async assigned(
    id: SubTasks['id'],
    userId: Users['id'],
    option: 'decline' | 'apply' | 'review'
  ) {
    if (option == 'decline') {
      return await prisma.subTasks.update({
        where: { id },
        data: {
          status: 'UNRESOLVED',
          users: {
            deleteMany: {
              subtaskId: id,
            },
          },
        },
        include: Queries.includeSubtask,
      });
    }
    if (option == 'apply') {
      const getHours = await prisma.subTasks.findUnique({
        where: { id },
        select: { days: true },
      });
      const today = new Date().getTime();
      const hours = (getHours ? getHours.days : 0) * 60 * 60 * 1000;
      const assignedAt = new Date(
        new Date().setHours(new Date().getHours() - 5)
      );
      return await prisma.subTasks.update({
        where: { id },
        data: {
          status: 'PROCESS',
          users: {
            create: {
              userId,
              assignedAt,
              untilDate: new Date(today + hours),
            },
          },
        },
        include: Queries.includeSubtask,
      });
    }
    if (option == 'review') {
      return prisma.subTasks.update({
        where: { id },
        data: {
          status: 'INREVIEW',
          hasPDF: false,
        },
        include: Queries.includeSubtask,
      });
    }
    throw new AppError('Oops!, Necesitamos un status para esta consulta', 400);
  }

  static async update(
    id: SubTasks['id'],
    data: Pick<SubTasks, 'name' | 'days' | 'price' | 'description'>
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateTask = await prisma.subTasks.update({
      where: { id },
      data,
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
    const updateTaskStatus = await prisma.subTasks.update({
      where: { id },
      data: {
        status,
      },
      include: Queries.includeSubtask,
    });
    const subTask = await prisma.subTasks.findUnique({ where: { id } });
    if (!subTask) throw new AppError('Oops!,ID invalido', 400);
    if (status === 'DONE') {
      // const files = await prisma.files.findMany({
      //   where: { subTasksId: id, type: 'REVIEW', feedback: { comment: {} } },
      // });
      const files = await prisma.files.findMany({
        where: {
          subTasksId: id,
          type: 'REVIEW',
          feedback: { comment: { equals: null } },
        },
      });
      const oldDir = await PathServices.subTask(id, 'REVIEW');
      const newDir = await PathServices.subTask(id, 'UPLOADS');
      const modelDir = await PathServices.subTask(id, 'MODEL');
      const filesPromises = files.map(async (file, index) => {
        const ext = file.name.split('.').at(-1);
        const newFileName =
          subTask.item + '.' + subTask.name + (index + 1) + '.' + ext;
        await prisma.files.create({
          data: {
            name: file.name,
            // dir: modelDir,
            type: 'MODEL',
            userId: file.userId,
            subTasksId: file.subTasksId,
          },
        });
        await prisma.files.update({
          where: { id: file.id },
          data: {
            type: 'UPLOADS',
            name: newFileName,
            //  dir: newDir
          },
        });
        copyFile(`${oldDir}/${file.name}`, `${modelDir}/${file.name}`).then(
          () => {
            fs.renameSync(`${oldDir}/${file.name}`, `${newDir}/${newFileName}`);
          }
        );
      });
      await Promise.all(filesPromises);
      return await prisma.subTasks.findUnique({
        where: { id },
        include: Queries.includeSubtask,
      });
    }
    if (status === 'PROCESS') {
      return await prisma.subTasks.update({
        where: { id },
        data: {
          users: {
            create: {
              userId: user.id,
            },
          },
        },
        include: Queries.includeSubtask,
      });
    }
    if (status === 'UNRESOLVED') {
      return await prisma.subTasks.update({
        where: { id },
        data: {
          users: {
            delete: {
              subtaskId_userId: {
                subtaskId: id,
                userId: user.id,
              },
            },
          },
        },
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
    const subTask = await prisma.subTasks.findUnique({
      where: { id },
    });
    if (!subTask) throw new AppError(`No se pudo encontrar la subtarea`, 404);
    const list = await prisma.subTasks.findMany({
      where: { levels_Id: subTask.levels_Id },
      orderBy: { item: 'asc' },
      include: {
        Levels: { select: { item: true } },
      },
    });
    const updateList = list.map(async ({ id, Levels }, i) => {
      const item = Levels?.item + '.' + (i + 1);
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
    const getHours = await prisma.subTasks.findUnique({
      where: { id },
      select: { days: true },
    });
    // const GMT = 60 * 60 * 1000;
    // const today = new Date().getTime();
    // const hours = (getHours ? getHours.days : 0) * GMT;
    // const assignedAt = new Date(new Date().setHours(new Date().getHours() - 5));
    // const assignUserBySubtaskPromises = userData.map(async user => {
    return await prisma.subTasks.update({
      where: { id },
      data: {
        status: 'PROCESS',
        users: {
          create: newUserData,
          updateMany: {
            data: {
              // untilDate: new Date(today + hours),
              // assignedAt,
            },
            where: {
              subtaskId: id,
            },
          },
        },
      },
      include: Queries.includeSubtask,
    });
    // }
    // );
    // await Promise.all(assignUserBySubtaskPromises);
    // return assignUserBySubtaskPromises[assignUserBySubtaskPromises.length - 1];
  }
}
export default SubTasksServices;
