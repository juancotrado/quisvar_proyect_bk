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
  static async update(id: Duty['id'], { description, untilDate }: Duty) {
    if (!id) throw new AppError(`Oops!, algo salio mal`, 400);
    const groups = await prisma.duty.update({
      where: { id },
      data: {
        description,
        untilDate,
      },
    });
    return groups;
  }
}
export default DutyServices;
