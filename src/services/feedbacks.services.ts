import AppError from '../utils/appError';
import { Feedback, SubTasks, prisma } from '../utils/prisma.server';
import Queries from '../utils/queries';

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
        user: Queries.selectProfileShort,
        files: {
          select: {
            id: true,
            name: true,
            dir: true,
            type: true,
            user: Queries.selectProfileShort,
          },
        },
      },
    });
    return getFeedBackList;
  }
  static async create({
    userId,
    subTasksId,
  }: Pick<Feedback, 'subTasksId' | 'userId'>) {
    const getFileList = await prisma.files.findMany({
      where: { subTasksId, type: 'REVIEW', feedback: { is: null } },
      select: { id: true },
    });
    if (!getFileList.length)
      throw new AppError('No se pudo encontrar archivos', 404);
    const newFeedBack = await prisma.feedback.create({
      data: {
        subTasksId,
        userId,
        files: { connect: getFileList },
      },
    });
    return newFeedBack;
  }
  static async update({ comment, id }: Feedback) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const updateFeedback = await prisma.feedback.update({
      where: { id },
      data: { comment },
    });
    return updateFeedback;
  }
}
export default FeedBackServices;
