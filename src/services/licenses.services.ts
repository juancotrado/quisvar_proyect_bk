import { ObjectNumber } from 'types/types';
import AppError from '../utils/appError';
import { Licenses, prisma } from '../utils/prisma.server';

class LicenseServices {
  static async create(data: Licenses) {
    if (!data) throw new AppError(`Datos incorrectos`, 400);
    const allowLicense = await prisma.licenses.findFirst({
      where: {
        usersId: data.usersId,
        status: {
          in: ['ACTIVO', 'ACEPTADO'],
        },
      },
    });
    if (allowLicense)
      throw new AppError(`Solo puede tener una licencia activa`, 400);
    const GMT = 60 * 60 * 1000;
    const _startDate = new Date(data.startDate).getTime();
    const _untilDate = new Date(data.untilDate).getTime();
    const startOfDay = new Date(_startDate - GMT * 5);
    const endOfDay = new Date(_untilDate - GMT * 5);
    const newLicence = await prisma.licenses.create({
      data: {
        usersId: data.usersId,
        reason: data.reason,
        type: data.type,
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
        AND: [{ status: 'ACTIVO' }, { status: 'ACEPTADO' }],
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
    const newLicence = await prisma.licenses.createMany({
      data: usersWithoutActiveLicenses.map(user => ({
        usersId: user.id,
        reason: data.reason,
        type: 'PERMISO',
        status: 'ACEPTADO',
        supervisorId: data.supervisorId,
        startDate: startOfDay,
        untilDate: endOfDay,
      })),
    });
    return newLicence;
  }

  static async update(id: Licenses['id'], data: Licenses) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const GMT = 60 * 60 * 1000;
    const _startDate = new Date(data.startDate).getTime();
    const _untilDate = new Date(data.untilDate).getTime();
    const startOfDay = new Date(_startDate - GMT * 5);
    const endOfDay = new Date(_untilDate - GMT * 5);
    const updateList = await prisma.licenses.update({
      where: { id },
      data: {
        ...data,
        startDate: startOfDay,
        untilDate: endOfDay,
      },
    });
    return updateList;
  }
  static async updateApprove(
    id: Licenses['id'],
    { feedback, status, supervisorId }: Licenses
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateList = await prisma.licenses.update({
      where: { id },
      data: {
        feedback,
        status,
        supervisorId,
      },
    });
    return updateList;
  }
  static async updateCheckOut(
    id: Licenses['id'],
    { checkout, fine, status }: Licenses
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateList = await prisma.licenses.update({
      where: { id },
      data: {
        checkout,
        fine,
        status,
      },
    });
    return updateList;
  }

  static async getLicenceById() {
    // const licenses = await prisma.licenses.groupBy({
    //   by: ['usersId'],
    //   where: {
    //     status: 'ACTIVO',
    //   },
    // });
    const licenses = await prisma.licenses.findMany({
      where: {
        status: 'ACTIVO',
      },
      select: {
        usersId: true,
        type: true,
      },
    });
    // console.log(licensesx)
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
      ...licenses.map(item => ({ usersId: item.usersId, status: item.type })),
      ...updatedData,
    ];
    return { licenses, mainData };
  }

  static async getLicensesByStatus(
    status: Licenses['status'],
    page?: number,
    pageSize?: number
  ) {
    const _page = page || 1;
    const _pageSize = pageSize || 20;
    const skip = (_page - 1) * _pageSize;
    const count = await prisma.licenses.count({
      where: status ? { status } : {},
      orderBy: {
        createdAt: 'desc',
      },
    });
    const licenses = await prisma.licenses.findMany({
      where: status ? { status } : {},
      orderBy: {
        createdAt: 'desc',
      },
      take: _pageSize,
      skip: skip,
    });
    return { licenses, count };
  }

  static async getLicensesEmployee(
    usersId: Licenses['usersId'],
    status?: Licenses['status'],
    page?: number,
    pageSize?: number
  ) {
    await this.deleteExpiredLicenses();
    const _page = page || 1;
    const _pageSize = pageSize || 20;
    const skip = (_page - 1) * _pageSize;
    const count = await prisma.licenses.count({
      where: {
        usersId,
        ...(status ? { status } : {}),
      },
    });
    const licenses = await prisma.licenses.findMany({
      where: {
        usersId,
        ...(status ? { status } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: _pageSize,
      skip: skip,
    });
    return { licenses, count };
  }

  static async getLicensesFee(
    startDate: string,
    endDate: string,
    usersId?: Licenses['usersId']
  ) {
    const GMT = 60 * 60 * 1000;
    const _startDate = new Date(startDate).getTime();
    const _endDate = new Date(endDate).getTime();
    const startOfDay = new Date(_startDate + GMT * 5);
    const endOfDay = new Date(_endDate + GMT * 29 - 1);
    const licenses = await prisma.licenses.findMany({
      where: {
        usersId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        checkout: true,
        fine: true,
      },
    });
    return this.countFee(licenses);
  }

  public static countFee(data: Pick<Licenses, 'fine' | 'checkout'>[]) {
    const result: ObjectNumber = data.reduce((fee: typeof result, item) => {
      const fine = item.fine;
      if (fine) fee[fine] = (fee[fine] || 0) + 1;
      return fee;
    }, {});
    return result;
  }

  static async activeLicenses() {
    const GMT = 5 * 60 * 60 * 1000;
    const now = new Date();
    const gmtMinus5Time = new Date(now.getTime() - GMT);

    const licenses = await prisma.licenses.findMany({
      where: {
        status: 'ACEPTADO',
        startDate: { lte: gmtMinus5Time },
        untilDate: { gte: gmtMinus5Time },
      },
      select: { id: true },
    });
    const listIds = licenses.map(({ id }) => id);
    await prisma.licenses.updateMany({
      where: { id: { in: listIds } },
      data: { status: 'ACTIVO' },
    });
    return licenses;
  }

  static async deleteExpiredLicenses() {
    await this.activeLicenses();

    const GMT = 5 * 60 * 60 * 1000;
    const now = new Date();
    const gmtMinus5Time = new Date(now.getTime() - GMT);

    const licenses = await prisma.licenses.findMany({
      where: {
        status: {
          in: ['ACTIVO', 'ACEPTADO'],
        },
        untilDate: { lt: gmtMinus5Time },
      },
      select: { id: true },
    });
    const listIds = licenses.map(({ id }) => id);
    await prisma.licenses.updateMany({
      where: { id: { in: listIds } },
      data: { status: 'INACTIVO' },
    });
    return licenses;
  }

  static async deleteLicense(id: Licenses['id']) {
    const licenses = await prisma.licenses.delete({
      where: { id },
    });

    return licenses;
  }
}
export default LicenseServices;
