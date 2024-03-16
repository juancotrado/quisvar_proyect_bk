// import AppError from '../utils/appError';
import AppError from '../utils/appError';
import { DutyMembers, prisma } from '../utils/prisma.server';

class DutyMembersServices {
  static async create(id: DutyMembers['dutyId']) {
    if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
    const member = await prisma.dutyMembers.create({
      data: { fullName: '', status: 'NO APTO', dutyId: id },
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
