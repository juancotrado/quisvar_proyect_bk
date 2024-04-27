// import AppError from '../utils/appError';
import AppError from '../utils/appError';
import { Duty, DutyMembers, Group, prisma } from '../utils/prisma.server';
import { TransformWeekDuty, getDaysOfWeekInRange } from '../utils/tools';

class DutyMembersServices {
  static async create(id: DutyMembers['dutyId']) {
    if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
    const member = await prisma.dutyMembers.create({
      data: {
        position: '',
        fullName: '',
        feedBack: '',
        dailyDuty: '',
        dutyId: id,
      },
    });
    await prisma.dutyTasks.create({
      data: {
        name: '',
        percentage: 0,
        dutyMemberId: member.id,
      },
    });
    return member;
  }
  static async getWeekTask(
    CUI: Duty['CUI'],
    groupId: Group['id'],
    date: string
  ) {
    if (!groupId || !CUI) throw new AppError(`Oops!, algo salio mal`, 400);
    const days = getDaysOfWeekInRange(date);
    const member = await prisma.duty.findMany({
      where: {
        CUI,
        groupList: {
          groupId,
        },
        createdAt: {
          gte: new Date(days[0].date),
          lte: new Date(days[6].date),
        },
      },
      include: {
        members: {
          include: {
            task: true,
          },
        },
      },
    });
    const transform = TransformWeekDuty(days, member);
    return transform;
  }
  static async delete(id: DutyMembers['id']) {
    if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
    const member = await prisma.dutyMembers.delete({
      where: { id },
    });
    return member;
  }
}
export default DutyMembersServices;
