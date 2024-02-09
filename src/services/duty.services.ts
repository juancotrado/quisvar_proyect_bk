import AppError from '../utils/appError';
import { Duty, prisma } from '../utils/prisma.server';

class DutyServices {
  static async create(data: Duty[]) {
    if (!data) throw new AppError(`Oops!, algo salio mal`, 400);
    const groups = await prisma.duty.createMany({
      data: data.map(values => ({
        ...values,
        untilDate: new Date(values.untilDate),
      })),
    });
    return groups;
  }
  static async update(data: Duty[]) {
    if (!data) throw new AppError(`Oops!, algo salio mal`, 400);
    for (const dutyData of data) {
      await prisma.duty.update({
        where: { id: dutyData.id },
        data: { ...dutyData, untilDate: new Date(dutyData.untilDate) },
      });
    }
    return 'ok';
  }
}
export default DutyServices;
