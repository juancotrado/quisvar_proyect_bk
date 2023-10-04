import AppError from '../utils/appError';
import { Licenses, LicensesStatus, prisma } from '../utils/prisma.server';

class LicenseServices {
  static async create(data: Licenses) {
    if (!data) throw new AppError(`Datos incorrectos`, 400);
    const GMT = 60 * 60 * 1000;
    const _startDate = new Date(data.startDate).getTime();
    const _untilDate = new Date(data.untilDate).getTime();
    const startOfDay = new Date(_startDate - GMT * 5);
    const endOfDay = new Date(_untilDate - GMT * 5);
    console.log(startOfDay, endOfDay);
    const newLicence = await prisma.licenses.create({
      data: {
        userId: data.userId,
        reason: data.reason,
        startDate: startOfDay,
        untilDate: endOfDay,
      },
    });
    return newLicence;
  }
  static async update(
    id: Licenses['id'],
    { reason, startDate, untilDate, userId }: Licenses
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateList = await prisma.licenses.update({
      where: { id },
      data: { reason, startDate, untilDate, userId },
    });
    return updateList;
  }
  static async getLicenceById() { // status: Licenses['status'], // userId: Licenses['id'],
    // if (!userId) throw new AppError('Oops!,ID invalido', 400);
    // if (!status) throw new AppError('Oops!,Estado incorrecto', 400);
    const GMT = 60 * 60 * 1000;
    const today = new Date().toISOString().split('T')[0];
    // const todays = new Date().toLocaleDateString().split('T')
    const _startDate = new Date(today).getTime();
    const startOfDay = new Date(_startDate + GMT * 5);
    const endOfDay = new Date(_startDate + GMT * 29 - 1);
    // console.log(startOfDay, endOfDay);

    const licenses = await prisma.licenses.groupBy({
      by: ['id', 'status'],
      where: {
        startDate: {
          gte: startOfDay,
        },
        untilDate: {
          lte: endOfDay,
        },
      },
    });
    return licenses;
  }
  static async getLicensesByStatus(status: Licenses['status']) {
    const licenses = await prisma.licenses.findMany({
      where: status ? { status } : {},
      orderBy: {
        createdAt: 'desc',
      },
    });
    return licenses;
  }
  static async getLicensesEmployee(
    userId: Licenses['userId'],
    status?: Licenses['status']
  ) {
    const licenses = await prisma.licenses.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return licenses;
  }
}
export default LicenseServices;
