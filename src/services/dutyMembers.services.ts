// import AppError from '../utils/appError';
import AppError from '../utils/appError';
import { DutyMembers, prisma } from '../utils/prisma.server';

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
  static async delete(id: DutyMembers['id']) {
    if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
    const member = await prisma.dutyMembers.delete({
      where: { id },
    });
    return member;
  }
}
export default DutyMembersServices;
