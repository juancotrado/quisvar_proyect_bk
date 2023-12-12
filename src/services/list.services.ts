import AppError from '../utils/appError';
import { List, ListOnUsers, Users, prisma } from '../utils/prisma.server';

class ListServices {
  static async create({ title, timer }: List) {
    if (!title || !timer) throw new AppError(`Oops!, algo salio mal`, 400);
    console.log(title, timer);
    const lastList = await prisma.list.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        users: true,
      },
      take: 1,
    });
    if (lastList[0].users.length === 0)
      throw new AppError(`Oops!, Al parecer hay una lista en curso`, 400);
    const newList = await prisma.list.create({
      data: {
        title,
        timer,
      },
    });
    return newList;
  }
  static async update(id: List['id'], { title, timer }: List) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateList = await prisma.list.update({
      where: { id },
      data: { title, timer },
    });
    return updateList;
  }
  static async assignedUser(listId: List['id'], records: ListOnUsers[]) {
    if (!records.length || !listId)
      throw new AppError(`No se pudo guardar la lista`, 400);
    const recordsWithUserId = records.map(record => ({ ...record, listId }));
    const assignedNewUser = await prisma.listOnUsers.createMany({
      data: recordsWithUserId,
    });
    return assignedNewUser;
  }
  static async updateStatusByUser(
    usersId: Users['id'],
    listId: List['id'],
    status: ListOnUsers['status']
  ) {
    if (!usersId || !listId) throw new AppError(`Oops!,ID invalido`, 400);
    const updateStatus = await prisma.listOnUsers.update({
      where: { usersId_listId: { listId, usersId } },
      data: { status },
    });
    return updateStatus;
  }
  static async getListById(listId: List['id']) {
    if (!listId) throw new AppError('Oops!,ID invalido', 400);
    const list = await prisma.list.findMany({
      where: {
        id: listId,
      },
      select: {
        title: true,
        timer: true,
        users: true,
        createdAt: true,
      },
    });
    if (!list.length)
      throw new AppError('No se pudo encontrar el registro de usuarios', 404);
    return list;
  }
  static async getAllListByDate(startDate: string) {
    const GMT = 60 * 60 * 1000;
    const _startDate = new Date(startDate).getTime();
    const startOfDay = new Date(_startDate + GMT * 5);
    const endOfDay = new Date(_startDate + GMT * 29 - 1);
    const list = await prisma.list.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        createdAt: true,
        id: true,
        title: true,
        timer: true,
        users: true,
      },
    });

    return list;
  }
  static async getListRange(startDate: string, endDate: string) {
    const GMT = 60 * 60 * 1000;
    const _startDate = new Date(startDate).getTime();
    const _endDate = new Date(endDate).getTime();
    const startOfDay = new Date(_startDate + GMT * 5);
    const endOfDay = new Date(_endDate + GMT * 29 - 1);
    const list = await prisma.users.findMany({
      select: {
        id: true,
        role: true,
        equipment: {
          select: {
            name: true,
            workStation: true,
          },
        },
        profile: {
          select: {
            firstName: true,
            lastName: true,
            dni: true,
            phone: true,
          },
        },
        list: {
          where: {
            list: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          },
          orderBy: {
            assignedAt: 'asc',
          },
          select: {
            status: true,
            usersId: true,
            list: {
              select: {
                createdAt: true,
                title: true,
                timer: true,
                id: true,
              },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });
    return list;
  }
  static async deleteManyList() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Ayer
    const GMT = 60 * 60 * 1000;
    const _yesterday = yesterday.getTime();
    const startOfDay = new Date(_yesterday + GMT * 5);
    const endOfDay = new Date(_yesterday + GMT * 29 - 1);
    const lists = await prisma.list.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        title: true,
        users: true,
        _count: true,
      },
    });
    const listsToDelete = lists.filter(list => list.users.length === 0);
    const deleteResult = await prisma.list.deleteMany({
      where: {
        id: {
          in: listsToDelete.map(list => list.id),
        },
      },
    });
    return deleteResult;
  }
}
export default ListServices;
