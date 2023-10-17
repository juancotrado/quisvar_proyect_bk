import AppError from '../utils/appError';
import { TrainingSpecialist, prisma } from '../utils/prisma.server';

class TrainingSpecialtyServices {
  static async createTrainingSpecialty(data: TrainingSpecialist) {
    if (!data) throw new AppError(`Datos incorrectos`, 400);
    const newTraining = await prisma.trainingSpecialist.create({
      data: {
        ...data,
        specialistId: +data.specialistId,
        issue: data.issue ? new Date(data.issue) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        untilDate: data.untilDate ? new Date(data.untilDate) : null,
      },
    });
    return newTraining;
  }
  static async getTrainingSpecialty(
    specialistId: TrainingSpecialist['specialistId']
  ) {
    const training = await prisma.trainingSpecialist.findMany({
      where: { specialistId },
    });
    const newData = Array.from(
      training
        .reduce((map, elem) => {
          const { trainingName, ...items } = elem;
          const oldData = map.get(trainingName) || {
            trainingName,
            datos: [],
          };
          oldData.datos.push(items);
          return map.set(trainingName, oldData);
        }, new Map())
        .values()
    );
    return newData;
  }
}
export default TrainingSpecialtyServices;
