import AppError from '../utils/appError';
import { BasicTaskOnUsers, prisma } from '../utils/prisma.server';
import { v4 as uuidv4 } from 'uuid';
interface UserList {
  userId: number;
  taskId: BasicTaskOnUsers['taskId'];
}

class BasicTaskOnUserServices {
  public static async add({ taskId, userId }: UserList) {
    const status = 'PROCESS';
    const list = [
      prisma.basicTasks.update({ where: { id: taskId }, data: { status } }),
      prisma.basicTaskOnUsers.create({
        data: { userId, taskId, status: true },
      }),
    ];
    return await prisma.$transaction(list).then(res => res[1]);
  }

  public static async authorizateUsers(ids: BasicTaskOnUsers['id'][]) {
    if (!ids.length) throw new AppError('Oops, ID invalido', 400);
    const updateStatusUser = await prisma.basicTaskOnUsers.updateMany({
      where: { id: { in: ids } },
      data: { status: false },
    });
    return updateStatusUser;
  }

  public static async addColaborators(
    id: BasicTaskOnUsers['id'],
    userList: { userId: number; percentage: number }[]
  ) {
    if (!id) throw new AppError('Oops, ID invalido', 400);
    const findTask = await prisma.basicTaskOnUsers.findUnique({
      where: { id },
      select: {
        percentage: true,
        taskId: true,
        assignedAt: true,
        finishedAt: true,
      },
    });
    if (!findTask) throw new AppError('Oops, usuario invalido', 400);
    const totalPercentage = userList.reduce((acc, u) => acc + u.percentage, 0);
    const { percentage, ...task } = findTask;
    if (totalPercentage > percentage)
      throw new AppError('Se excedio el tamaño de porcentage', 400);
    const groupId = uuidv4();
    const data = userList.map(user => ({
      ...task,
      status: false,
      groupId,
      ...user,
    }));
    const queryList = [
      prisma.basicTaskOnUsers.update({
        where: { id },
        data: {
          status: false,
          percentage: percentage - totalPercentage,
          groupId,
        },
      }),
      prisma.basicTaskOnUsers.createMany({
        data,
      }),
      prisma.basicTaskOnUsers.create({
        data: {
          userId: findTask.taskId,
          taskId: findTask.taskId,
          status: true,
        },
      }),
    ];
    const createUsers = await prisma
      .$transaction(queryList)
      .then(res => res[0]);
    return createUsers;
  }

  public static async addMod({ taskId, userId }: UserList) {
    const addNewMod = await prisma.basicTasks.update({
      where: { id: taskId },
      data: { mods: { set: [], connect: { id: userId } } },
    });
    return addNewMod;
  }

  public static async remove(id: BasicTaskOnUsers['id']) {
    const findUser = await prisma.basicTaskOnUsers.findUnique({
      where: { id },
      select: {
        task: { select: { id: true, _count: { select: { users: true } } } },
      },
    });
    if (!findUser) throw new AppError('Opps, usuario no encontrado', 404);
    const status = findUser.task._count.users - 1 ? 'UNRESOLVED' : 'PROCESS';
    const list = [
      prisma.basicTaskOnUsers.delete({ where: { id } }),
      prisma.basicTasks.update({
        where: { id: findUser.task.id },
        data: { status },
      }),
    ];
    return await prisma.$transaction(list).then(res => res[1]);
  }

  public static async removeMod({ taskId, userId }: UserList) {
    const removeNewMod = await prisma.basicTasks.update({
      where: { id: taskId },
      data: { mods: { disconnect: { id: userId } } },
    });
    return removeNewMod;
  }

  public static async updatePercentage(
    id: BasicTaskOnUsers['id'],
    { percentage }: BasicTaskOnUsers
  ) {
    const updatePercentage = await prisma.basicTaskOnUsers.update({
      where: { id },
      data: { percentage },
    });
    return updatePercentage;
  }

  public static async updateStatusPayment(
    listPercentage: Pick<BasicTaskOnUsers, 'id' | 'percentagePayment'>[]
  ) {
    const updatePercentages = listPercentage.map(({ id, percentagePayment }) =>
      prisma.basicTaskOnUsers.update({
        where: { id },
        data: { percentagePayment },
      })
    );
    return await prisma.$transaction(updatePercentages);
  }

  public static async getReport(
    userId: number,
    { initialDate, untilDate }: { initialDate: Date; untilDate: Date }
  ) {
    const getReport = await prisma.basicTaskOnUsers.findMany({
      where: {
        userId,
        assignedAt: { gte: initialDate, lte: untilDate },
        finishedAt: { not: null },
      },
      select: {
        id: true,
        percentage: true,
        assignedAt: true,
        finishedAt: true,
        task: {
          select: {
            id: true,
            index: true,
            typeItem: true,
            name: true,
            status: true,
            Levels: {
              select: {
                id: true,
                typeItem: true,
                levelList: true,
                index: true,
                stages: { select: { project: { select: { name: true } } } },
              },
            },
          },
        },
      },
    });
    return getReport;
  }
}
export default BasicTaskOnUserServices;
