import AppError from '../utils/appError';
import { Feedback, SubTasks, prisma } from '../utils/prisma.server';

class FeedBackServices {
  static async find(subTasksId: SubTasks['id']) {
    if (!subTasksId) throw new AppError('Oops, ID invalid', 400);
    const getFeedBackList = await prisma.feedback.findMany({
      where: { subTasksId },
      select: {
        id: true,
        comment: true,
        status: true,
        createdAt: true,
        files: {
          select: {
            id: true,
            name: true,
            dir: true,
            type: true,
            user: {
              select: {
                id: true,
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });
    return getFeedBackList;
  }
  static async create(
    {
      subTasksId,
      comment,
    }: //     filesList,
    Pick<Feedback, 'subTasksId' | 'comment'> //       & { //     filesList: { id: number }[]; //   }
  ) {
    const getFileList = await prisma.files.findMany({
      where: { subTasksId, type: 'REVIEW', feedback: { is: null } },
      select: { id: true },
    });
    if (getFileList.length === 0)
      throw new AppError('No se pudo encontrar archivos', 404);
    const newFeedBack = await prisma.feedback.create({
      data: {
        subTasksId,
        files: { connect: getFileList },
        comment,
      },
    });
    return newFeedBack;
  }
}
export default FeedBackServices;
