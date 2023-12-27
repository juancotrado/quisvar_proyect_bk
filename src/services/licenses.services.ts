import AppError from '../utils/appError';
import { Licenses, prisma } from '../utils/prisma.server';

class LicenseServices {
  static async create(data: Licenses) {
    console.log(data);

    if (!data) throw new AppError(`Datos incorrectos`, 400);
    const allowLicense = await prisma.licenses.findFirst({
      where: {
        usersId: data.usersId,
        status: 'ACTIVE',
      },
    });
    if (allowLicense)
      throw new AppError(`Solo puede tener una licencia activa`, 400);
    const GMT = 60 * 60 * 1000;
    const _startDate = new Date(data.startDate).getTime();
    const _untilDate = new Date(data.untilDate).getTime();
    const startOfDay = new Date(_startDate - GMT * 5);
    const endOfDay = new Date(_untilDate - GMT * 5);
    console.log(startOfDay, endOfDay);
    const newLicence = await prisma.licenses.create({
      data: {
        usersId: data.usersId,
        reason: data.reason,
        startDate: startOfDay,
        untilDate: endOfDay,
      },
    });
    return newLicence;
  }
  static async createFreeForAll(data: Licenses) {
    const getAllUsers = await prisma.users.findMany({
      where: {
        status: true,
      },
      select: {
        id: true,
      },
    });
    const allowLicense = await prisma.licenses.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        usersId: true,
      },
    });
    const usersWithoutActiveLicenses = getAllUsers.filter(user => {
      return !allowLicense.some(activeUser => activeUser.usersId === user.id);
    });
    const GMT = 60 * 60 * 1000;
    const _startDate = new Date(data.startDate).getTime();
    const _untilDate = new Date(data.untilDate).getTime();
    const startOfDay = new Date(_startDate - GMT * 5);
    const endOfDay = new Date(_untilDate - GMT * 5);
    console.log(usersWithoutActiveLicenses);
    const newLicence = await prisma.licenses.createMany({
      data: usersWithoutActiveLicenses.map(user => ({
        usersId: user.id,
        reason: data.reason,
        status: 'ACTIVE',
        startDate: startOfDay,
        untilDate: endOfDay,
      })),
    });
    return newLicence;
  }
  static async update(
    id: Licenses['id'],
    {
      reason,
      startDate,
      untilDate,
      usersId,
      feedback,
      status,
      checkout,
      fine,
    }: Licenses
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateList = await prisma.licenses.update({
      where: { id },
      data: {
        reason,
        startDate,
        untilDate,
        usersId,
        feedback,
        status,
        checkout,
        fine,
      },
    });
    return updateList;
  }
  static async getLicenceById() {
    const licenses = await prisma.licenses.groupBy({
      by: ['usersId'],
      where: {
        status: 'ACTIVE',
      },
    });
    const usersActive = await prisma.users.groupBy({
      by: ['id'],
      where: {
        status: true,
      },
    });
    const updatedData = usersActive
      .filter(item => !licenses.some(exclude => exclude.usersId === item.id))
      .map(item => ({ usersId: item.id, status: 'PUNTUAL' }));

    const mainData = [
      ...licenses.map(item => ({ ...item, status: 'PERMISO' })),
      ...updatedData,
    ];
    return { licenses, mainData };
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
    usersId: Licenses['usersId'],
    status?: Licenses['status']
  ) {
    await this.deleteExpiredLicenses();
    const licenses = await prisma.licenses.findMany({
      where: {
        usersId,
        ...(status ? { status } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return licenses;
  }
  static async deleteExpiredLicenses() {
    const GMT = 5 * 60 * 60 * 1000;
    const now = new Date();
    const gmtMinus5Time = new Date(now.getTime() - GMT);

    const licenses = await prisma.licenses.findMany({
      where: {
        status: 'ACTIVE',
        untilDate: { lt: gmtMinus5Time },
      },
      select: { id: true },
    });
    const listIds = licenses.map(({ id }) => id);
    await prisma.licenses.updateMany({
      where: { id: { in: listIds } },
      data: { status: 'INACTIVE' },
    });
    return licenses;
  }
}
export default LicenseServices;
