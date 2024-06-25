import AppError from '../utils/appError';
import { BasicTaskOnUsers, prisma } from '../utils/prisma.server';
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

  public static async addMod({ taskId, userId }: UserList) {
    const addNewMod = await prisma.basicTasks.update({
      where: { id: taskId },
      data: { mods: { connect: { id: userId } } },
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
