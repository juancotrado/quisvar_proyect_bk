import AppError from '../utils/appError';
import { WorkStation, prisma } from '../utils/prisma.server';

class WorkStationServices {
  static async createWorkStation(data: WorkStation) {
    if (!data) throw new AppError(`Datos incorrectos`, 400);
    const stations = await prisma.workStation.create({
      data,
    });
    return stations;
  }
  static async getWorkStation() {
    const stations = await prisma.workStation.findMany({
      select: {
        name: true,
        total: true,
        equipment: true,
      },
    });

    return stations;
  }
  static async updateWorkStation(id: WorkStation['id'], data: WorkStation) {
    const stations = await prisma.workStation.update({
      where: { id },
      data,
    });

    return stations;
  }
  static async deleteWorkStation(id: WorkStation['id']) {
    const stations = await prisma.workStation.delete({
      where: { id },
    });

    return stations;
  }
}
export default WorkStationServices;
