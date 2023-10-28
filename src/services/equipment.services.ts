import AppError from '../utils/appError';
import { Equipment, prisma } from '../utils/prisma.server';
import Queries from '../utils/queries';

class EquipmentServices {
  static async createEquipment(data: Equipment) {
    if (!data) throw new AppError(`Datos incorrectos`, 400);
    const equipment = await prisma.equipment.create({
      data,
    });
    return equipment;
  }
  static async getEquipment(id: Equipment['id']) {
    const equipment = await prisma.equipment.findMany({
      where: { id },
    });

    return equipment;
  }
  static async updateEquipment(id: Equipment['id'], data: Equipment) {
    const equipment = await prisma.equipment.update({
      where: { id },
      data,
    });

    return equipment;
  }
  static async deleteEquipment(id: Equipment['id']) {
    const equipment = await prisma.equipment.delete({
      where: { id },
    });

    return equipment;
  }
}
export default EquipmentServices;
