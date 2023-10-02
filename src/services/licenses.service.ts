import AppError from '../utils/appError';
import { Licenses, prisma } from '../utils/prisma.server';

class LicenseServices {
  static async create(data: Licenses) {
    console.log(data);

    if (!data) throw new AppError(`Datos incorrectos`, 400);
    const startDate = new Date(data.startDate);
    const untilDate = new Date(data.untilDate);
    console.log(startDate);

    const newLicence = await prisma.licenses.create({
      data: {
        userId: data.userId,
        reason: data.reason,
        startDate: startDate,
        untilDate: untilDate,
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
  static async getLicenceById(licenceId: Licenses['id']) {
    if (!licenceId) throw new AppError('Oops!,ID invalido', 400);
    const licenses = await prisma.licenses.findMany({
      where: {
        id: licenceId,
      },
    });
    if (!licenses.length) throw new AppError('Aun no hay licencias', 404);
    return licenses;
  }
}
export default LicenseServices;
