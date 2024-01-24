import { Messages, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import { ParametersMail } from 'types/types';
import Queries from '../utils/queries';
import AppError from '../utils/appError';

class GroupMailServices {
  private static category: Messages['category'] = 'GLOBAL';

  public static async getByUser(
    userId: Users['id'],
    { skip, type, status, typeMessage }: ParametersMail
  ) {
    const mail = await prisma.mail.findMany({
      where: {
        userId,
        type,
        message: { type: typeMessage, status, category: this.category },
      },
      orderBy: { message: { updatedAt: 'desc' } },
      skip,
      take: 20,
      select: {
        messageId: true,
        status: true,
        type: true,
        message: Queries.PayMail().selectMessage('MAIN', type),
      },
    });
    const total = await prisma.mail.count({
      where: { userId, type, message: { status, type: typeMessage } },
    });
    return { total, mail };
  }

  public static async getMessage(id: Messages['id']) {
    if (!id) throw new AppError('Ops!, ID invalido', 400);
    const getMessage = await prisma.messages.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            userInit: true,
            userId: true,
            type: true,
            role: true,
            status: true,
            user: Queries.selectProfileUser,
          },
        },
        files: {
          orderBy: { id: 'desc' },
          select: { id: true, name: true, path: true, attempt: true },
        },
        // history: {
        //   include: {
        //     files: {
        //       orderBy: { id: 'desc' },
        //       select: { id: true, name: true, path: true },
        //     },
        //     user: Queries.selectProfileUser,
        //   },
        // },
      },
    });

    if (!getMessage)
      throw new AppError('No se pudo encontrar datos del mensaje', 404);
    const userInit = getMessage.users.find(user => user.userInit);
    return { ...getMessage, userInit };
  }
}
export default GroupMailServices;
