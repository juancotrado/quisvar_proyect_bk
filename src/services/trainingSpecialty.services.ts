import AppError from '../utils/appError';
import { TrainingSpecialist, prisma } from '../utils/prisma.server';

class TrainingSpecialtyServices {
  static async createTrainingSpecialty(data: TrainingSpecialist) {
    if (!data) throw new AppError(`Datos incorrectos`, 400);
    const newTraining = await prisma.trainingSpecialist.create({
      data: {
        ...data,
        TrainingSpecialistNameId: +data.TrainingSpecialistNameId,
        issue: data.issue ? new Date(data.issue) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        untilDate: data.untilDate ? new Date(data.untilDate) : null,
      },
    });
    return newTraining;
  }
  static async getTrainingSpecialty(
    TrainingSpecialistNameId: TrainingSpecialist['TrainingSpecialistNameId']
  ) {
    const training = await prisma.trainingSpecialist.findMany({
      where: { TrainingSpecialistNameId },
    });

    return training;
  }
  static async updateTrainingSpecialty(
    id: TrainingSpecialist['id'],
    {
      hours,
      institution,
      issue,
      startDate,
      trainingFile,
      untilDate,
    }: TrainingSpecialist
  ) {
    const training = await prisma.trainingSpecialist.update({
      where: { id },
      data: {
        id,
        institution,
        hours,
        issue: issue ? new Date(issue) : null,
        startDate: startDate ? new Date(startDate) : null,
        untilDate: untilDate ? new Date(untilDate) : null,
        trainingFile,
      },
    });

    return training;
  }
  static async deleteTrainingSpecialty(id: TrainingSpecialist['id']) {
    const training = await prisma.trainingSpecialist.delete({
      where: { id },
    });

    return training;
  }
}
export default TrainingSpecialtyServices;
