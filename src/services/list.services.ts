import AppError from '../utils/appError';
import { List, ListOnUsers, Users, prisma } from '../utils/prisma.server';

class ListServices {
  static async create({ title }: List) {
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
  static async assignedUser(
    usersId: Users['id'],
    listId: List['id'],
    status: ListOnUsers['status']
  ) {
    if (!usersId || !listId) throw new AppError(`Oops!,ID invalido`, 400);
    const assignedNewUser = await prisma.listOnUsers.create({
      data: { listId, status, usersId },
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
}
export default ListServices;
