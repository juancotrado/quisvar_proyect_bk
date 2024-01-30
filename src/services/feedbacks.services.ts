import AppError from '../utils/appError';
import { Feedback, SubTasks, Users, prisma } from '../utils/prisma.server';

class FeedBackServices {
  static async find(subTasksId: SubTasks['id']) {
    if (!subTasksId) throw new AppError('Oops, ID invalid', 400);
    const getFeedBackList = await prisma.feedback.findMany({
      where: { subTasksId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        comment: true,
        status: true,
        createdAt: true,
        // users: Queries.selectProfileShort,
        files: {
          select: {
            id: true,
            name: true,
            dir: true,
            type: true,
          },
        },
      },
    });
    return getFeedBackList;
  }
  static async create({
    userId,
    subTasksId,
    percentage,
  }: Feedback & { userId: Users['id'] }) {
    const getFileList = await prisma.files.findMany({
      where: { subTasksId, type: 'REVIEW', feedback: { is: null } },
      select: { id: true },
    });
    if (!getFileList.length)
      throw new AppError('No se pudo encontrar archivos', 404);
    const newFeedBack = await prisma.feedback.create({
      data: {
        subTasksId,
        percentage,
        users: { create: { userId, userMain: true } },
        files: { connect: getFileList },
      },
    });
    return newFeedBack;
  }
  static async update({
    comment,
    id,
    userId,
    status,
  }: Feedback & { userId: Users['id'] }) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        comment,
        status,
        users: {
          connectOrCreate: {
            where: { userId_feedbackId: { feedbackId: id, userId } },
            create: { userId },
          },
        },
      },
    });
    return updateFeedback;
  }
}
export default FeedBackServices;
