import AppError from '../utils/appError';
import { Specialists, prisma } from '../utils/prisma.server';

class SpecialistServices {
  static async createSpecialist(data: Specialists) {
    if (!data) throw new AppError(`No hay datos`, 400);
    const newSpecialist = await prisma.specialists.create({ data });
    return newSpecialist;
  }
  static async getSpecialist() {
    const specialist = await prisma.specialists.findMany({
      orderBy: {
        lastName: 'asc',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dni: true,
      },
    });
    return specialist;
  }
  static async updateSpecialist(data: Specialists, id: Specialists['id']) {
    if (!data) throw new AppError(`No hay datos`, 400);
    const newSpecialist = await prisma.specialists.update({
      where: { id },
      data: {
        ...data,
        inscriptionDate: new Date(data.inscriptionDate),
      },
    });
    return newSpecialist;
  }
  static async getSpecialistByDNI(dni: Specialists['dni']) {
    const specialist = await prisma.specialists.findMany({
      where: {
        dni: {
          startsWith: dni,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dni: true,
      },
    });
    return specialist;
  }
  static async getSpecialistById(id: Specialists['id']) {
    const specialist = await prisma.specialists.findFirst({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        career: true,
        tuition: true,
        degree: true,
        dni: true,
        email: true,
        agreementFile: true,
        cvFile: true,
        inscription: true,
        inscriptionDate: true,
        phone: true,
      },
    });
    return specialist;
  }
}
export default SpecialistServices;
