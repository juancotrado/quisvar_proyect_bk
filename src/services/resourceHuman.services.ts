import { Reports, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import {
  ReportByUserPick,
  SupervisorPick,
  User,
  updateReports,
} from 'types/types';
import AppError from '../utils/appError';
import Queries from '../utils/queries';

class ResourceHumanServices {
  static async viewReports(supervisorId: Users['id']) {
    // const listReports = await prisma.supervisorOnReports.findMany({
    //   where: { supervisorId },
    //   include: {
    //     report: { include: { user: Queries.selectProfileUser } },
    //   },
    // });
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      select: {
        id: true,
        user: Queries.selectProfileUser,
      },
    });
    const reports = await prisma.reports.findMany({
      where: {
        supervisors: { some: { supervisorId } },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        status: true,
        stage: true,
        createdAt: true,
        user: Queries.selectProfileUser,
      },
    });
    return { supervisor, reports };
  }
  static async addSupervisor(data: SupervisorPick) {
    const addNewUser = await prisma.supervisor.create({ data });
    return addNewUser;
  }
  static async newReport({ userId, name, supervisorId }: ReportByUserPick) {
    const createReport = await prisma.reports.create({
      data: {
        name,
        user: { connect: { id: userId } },
        supervisors: { create: { supervisorId } },
      },
    });
    return createReport;
  }
  static async updateStatusReport(
    id: Reports['id'],
    { status, supervisorId, stage, comments }: updateReports
  ) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateStatus = await prisma.reports.update({
      where: { id },
      data: {
        status,
        stage,
        supervisors: { create: { supervisorId, comments } },
      },
    });
    return updateStatus;
  }
  static async declineReport(
    reportId: Reports['id'],
    { supervisorId }: updateReports
  ) {
    const declineSupervisor = await prisma.supervisorOnReports.delete({
      where: {
        supervisorId_reportId: {
          supervisorId,
          reportId,
        },
      },
    });
    return declineSupervisor;
  }
  static async delete(id: Reports['id']) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const deleteReport = await prisma.reports.delete({ where: { id } });
    return deleteReport;
  }
}
export default ResourceHumanServices;
