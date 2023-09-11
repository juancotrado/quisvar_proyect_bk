import { Reports, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import { SupervisorPick, updateReports } from 'types/types';
import AppError from '../utils/appError';

class ResourceHumanServices {
  static async addSupervisor(data: SupervisorPick) {
    const addNewUser = await prisma.supervisor.create({ data });
    return addNewUser;
  }
  static async newReport({ id, name }: Pick<Users, 'id'> & { name: string }) {
    const createReport = await prisma.reports.create({
      data: { name, user: { connect: { id } } },
    });
    return createReport;
  }
  static async updateStatusReport(
    id: Reports['id'],
    { status, supervisorId }: updateReports
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateStatus = await prisma.reports.update({
      where: { id },
      data: { status, supervisors: { create: { supervisorId } } },
    });
    return updateStatus;
  }
  static async delete(id: Reports['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const deleteReport = await prisma.reports.delete({ where: { id } });
    return deleteReport;
  }
}
export default ResourceHumanServices;
