import AppError from '../utils/appError';
import { Consortium, prisma } from '../utils/prisma.server';

class ConsortiumServices {
  static async create(data: Consortium) {
    if (!data) throw new AppError(`Oops!, algo salio mal`, 400);
    const consortiums = await prisma.consortium.create({ data });
    return consortiums;
  }
  static async getAllConsortium() {
    const consortiums = await prisma.consortium.findMany({
      select: {
        id: true,
        companies: true,
        name: true,
        manager: true,
      },
    });
    return consortiums;
  }
  static async getConsortiumById(id: Consortium['id']) {
    if (!id) throw new AppError(`Oops!, id no encontrado`, 400);
    const consortiums = await prisma.consortium.findFirst({
      where: { id },
      select: {
        id: true,
        manager: true,
        companies: true,
        name: true,
      },
    });
    return consortiums;
  }
  static async updateById(id: Consortium['id'], { name, manager }: Consortium) {
    if (!id) throw new AppError(`Oops!, id no encontrado`, 400);
    const consortiums = await prisma.consortium.update({
      where: { id },
      data: { name, manager },
    });
    return consortiums;
  }
  static async deleteById(id: Consortium['id']) {
    if (!id) throw new AppError(`Oops!, id no encontrado`, 400);
    const consortiums = await prisma.consortium.delete({
      where: { id },
    });
    return consortiums;
  }
}
export default ConsortiumServices;
