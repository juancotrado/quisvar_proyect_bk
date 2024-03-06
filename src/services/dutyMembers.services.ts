// import AppError from '../utils/appError';
import { DutyMembers, prisma } from '../utils/prisma.server';

class DutyMembersServices {
  static async create(name: DutyMembers['fullName']) {
    const member = await prisma.dutyMembers.findFirst({
      where: { fullName: name },
    });
    return member;
  }
}
export default DutyMembersServices;
