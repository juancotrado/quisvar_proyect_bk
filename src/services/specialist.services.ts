import AppError from '../utils/appError';
import { Specialists, prisma } from '../utils/prisma.server';

class SpecialistServices {
  static async createSpecialist(data: Specialists) {
    if (!data) throw new AppError(`No hay datos`, 400);
    const newSpecialist = await prisma.specialists.create({ data });
    return newSpecialist;
  }
  static async getSpecialist() {
    const companies = await prisma.specialists.findMany({
      orderBy: {
        lastName: 'asc',
      },
    });
    return companies;
  }
  static async getSpecialistByDNI(dni: Specialists['dni']) {
    const companies = await prisma.specialists.findMany({
      where: {
        dni: {
          startsWith: dni,
        },
      },
    });
    return companies;
  }
}
export default SpecialistServices;
