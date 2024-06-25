import { BasicFeedback, BasicTasks } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import { UserType } from '../middlewares/auth.middleware';
import { BasicFilesForm } from 'types/types';

class FeedbackBasicServices {
  public static async showByTask(subTasksId: BasicTasks['id']) {
    const list = await prisma.basicFeedback.findMany({
      where: { subTasksId },
      select: {
        id: true,
        comment: true,
        createdAt: true,
        type: true,
        reviewer: true,
        author: true,
        files: {
          select: { id: true, name: true, dir: true, originalname: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return list;
  }

  public static async create(
    {
      subTasksId,
      percentage,
      files,
    }: Pick<BasicFeedback, 'subTasksId' | 'percentage'> & {
      files: BasicFilesForm[];
    },
    { id: userId, profile }: UserType
  ) {
    const { lastName, firstName } = profile;
    const queryList = [
      prisma.basicTasks.update({
        where: { id: subTasksId },
        data: { status: 'INREVIEW' },
      }),
      prisma.basicFeedback.create({
        data: {
          subTasksId,
          users: { create: { userId, userMain: true } },
          percentage,
          author: firstName + ' ' + lastName,
          files: { createMany: { data: files } },
        },
        include: { files: true },
      }),
    ];
    return await prisma.$transaction(queryList).then(res => res[1]);
  }

  public static async review(
    {
      id,
      type,
      comment,
      percentage,
      userIdTask,
    }: BasicFeedback & { userIdTask: number },
    { id: userId, profile }: UserType
  ) {
    const { lastName, firstName } = profile;
    // status: false  para despues para pago
    const queryList = [
      prisma.basicFeedback.update({
        where: { id },
        data: {
          reviewer: lastName + ' ' + firstName,
          type,
          comment,
          percentage,
          status: true,
          subTasks: {
            update: {
              status: type === 'ACCEPTED' ? 'REVIEWED' : 'DENIED',
              users:
                type === 'ACCEPTED'
                  ? {
                      update: {
                        where: { id: userIdTask },
                        data: { percentage },
                      },
                    }
                  : undefined,
            },
          },
          users: {
            connectOrCreate: {
              where: { userId_feedbackId: { feedbackId: id, userId } },
              create: { userId },
            },
          },
        },
      }),
    ];
    return await prisma.$transaction(queryList);
  }
}
export default FeedbackBasicServices;
