import AppError from '../utils/appError';
import { List, ListOnUsers, Users, prisma } from '../utils/prisma.server';

class ListServices {
  static async create({ title }: List) {
    if (!title) throw new AppError(`No hay titulo`, 400);
    const newList = await prisma.list.create({ data: { title } });
    return newList;
  }
  static async update(id: List['id'], { title }: List) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateList = await prisma.list.update({
      where: { id },
      data: { title },
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
      select: {
        createdAt: true,
        id: true,
        title: true,
        users: true,
      },
    });

    return list;
  }
  static async getListRange(startDate: string, endDate?: string) {
    const GMT = 60 * 60 * 1000;
    const _startDate = new Date(startDate).getTime();
    const startOfDay = new Date(_startDate + GMT * 5);
    const endOfDay = new Date(_startDate + GMT * 29 - 1);
    const list = await prisma.users.findMany({
      select: {
        id: true,
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
            assignedAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          select: {
            status: true,
            assignedAt: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
    console.log(list.length);

    return list;
  }
}
export default ListServices;
