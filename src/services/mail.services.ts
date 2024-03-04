import { Mail, Messages, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import {
  FileMessagePick,
  ParametersMail,
  PickMail,
  PickMessageReply,
  ReceiverT,
} from 'types/types';
import Queries from '../utils/queries';
import AppError from '../utils/appError';

type UpdateMessage = Pick<
  PickMessageReply,
  'senderId' | 'receiverId' | 'header' | 'description' | 'title'
>;
class MailServices {
  public static async getByUser(
    userId: Users['id'],
    category: Messages['category'],
    { skip, type, status, typeMessage }: ParametersMail
  ) {
    const mail = await prisma.mail.findMany({
      where: {
        userId,
        type,
        message: { type: typeMessage, status, category },
      },
      orderBy: { message: { updatedAt: 'desc' } },
      skip,
      take: 20,
      select: {
        messageId: true,
        status: true,
        type: true,
        message: Queries.PayMail().selectMessage('MAIN'),
      },
    });
    const parseList = mail.map(({ message, ...data }) => {
      const userInit = message.users.find(user => user.userInit);
      const _message = { ...message, userInit };
      return { ...data, message: _message };
    });
    const total = await prisma.mail.count({
      where: { userId, type, message: { status, type: typeMessage, category } },
    });
    return { total, mail: parseList };
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
        history: {
          include: {
            files: {
              orderBy: { id: 'desc' },
              select: { id: true, name: true, path: true },
            },
            user: Queries.selectProfileUser,
          },
        },
      },
    });

    if (!getMessage)
      throw new AppError('No se pudo encontrar datos del mensaje', 404);
    const { users: usersMessage, ...message } = getMessage;
    const initialSender = usersMessage.find(({ userInit }) => userInit);
    // const users = usersMessage.filter(({ userInit }) => !userInit);
    return { ...message, initialSender, users: usersMessage };
  }

  public static async create(
    {
      title,
      description,
      type,
      header,
      senderId,
      receiverId,
      secondaryReceiver,
    }: Omit<PickMail, 'id'>,
    category: Messages['category'],
    files: FileMessagePick[]
  ) {
    const typeMail: Mail['type'] = 'SENDER';
    const role: Mail['role'] = 'MAIN';
    const status = true;
    if (category === 'GLOBAL') {
      const createMessage = await prisma.messages.create({
        data: {
          title,
          header,
          description,
          type,
          category,
          users: {
            createMany: {
              data: [
                ...secondaryReceiver,
                { userId: senderId, role, type: typeMail, userInit: true },
              ],
              skipDuplicates: true,
            },
          },
          files: { createMany: { data: files } },
        },
      });
      return createMessage;
    }
    const createMessage = await prisma.messages.create({
      data: {
        title,
        header,
        description,
        type,
        category,
        users: {
          createMany: {
            data: [
              ...secondaryReceiver,
              { userId: senderId, role, type: typeMail, userInit: true },
              { userId: receiverId, role, status },
            ],
            skipDuplicates: true,
          },
        },
        files: { createMany: { data: files } },
      },
    });
    return createMessage;
  }

  public static async createReply(
    id: number,
    {
      receiverId,
      senderId,
      status,
      ...data
    }: Omit<
      PickMessageReply,
      'messageId' | 'paymessageId' | 'createdAt' | 'id' | 'userId'
    >,
    files: Pick<FileMessagePick, 'name' | 'path'>[]
  ) {
    if (!receiverId || !senderId)
      throw new AppError('Ingrese Destinatario', 400);
    const receiv: ReceiverT = { type: 'RECEIVER', role: 'MAIN', status: true };
    await prisma.mail.update({
      where: { userId_messageId: { messageId: id, userId: senderId } },
      data: { type: 'SENDER', status: false },
    });
    if (status === 'RECHAZADO') {
      await prisma.mail.updateMany({
        where: { userInit: true },
        data: { ...receiv },
      });
    } else {
      await prisma.mail.upsert({
        where: { userId_messageId: { messageId: id, userId: receiverId } },
        update: { ...receiv },
        create: { messageId: id, userId: receiverId, ...receiv },
      });
    }
    await prisma.messages.update({ where: { id }, data: { status } });
    const createForward = await prisma.messageHistory.create({
      data: {
        ...data,
        user: { connect: { id: senderId } },
        message: { connect: { id } },
        files: { createMany: { data: files } },
      },
    });
    return createForward;
  }

  public static async updateMessage(
    id: Messages['id'],
    { senderId, receiverId, ...data }: UpdateMessage,
    files: FileMessagePick[]
  ) {
    if (!receiverId || !senderId)
      throw new AppError('Ingrese Destinatario', 400);
    const updateMessage = await prisma.messages.update({
      where: { id },
      data: {
        ...data,
        status: 'PENDIENTE',
        files: { createMany: { data: files } },
      },
    });
    await prisma.mail.updateMany({
      where: { userInit: true },
      data: { type: 'SENDER', role: 'MAIN', status: false },
    });
    await prisma.mail.update({
      where: { userId_messageId: { messageId: id, userId: receiverId } },
      data: { type: 'RECEIVER', role: 'MAIN', status: true },
    });
    return updateMessage;
  }

  public static async archived(id: Messages['id'], senderId: number) {
    const archived = await prisma.messages.update({
      where: { id },
      data: {
        status: 'ARCHIVADO',
        users: {
          updateMany: { where: { messageId: id }, data: { ...this.dataDone } },
        },
      },
    });
    await prisma.mail.update({
      where: { userId_messageId: { messageId: id, userId: senderId } },
      data: { type: 'SENDER' },
    });
    return archived;
  }

  public static readonly dataDone: ReceiverT = {
    type: 'RECEIVER',
    role: 'SECONDARY',
    status: false,
  };

  public static async done(id: Messages['id'], senderId: number) {
    if (!id) throw new AppError('Ops, ID invalido', 400);
    if (!senderId) throw new AppError('Ingrese Destinatario', 400);
    const done = await prisma.messages.update({
      where: { id },
      data: {
        status: 'FINALIZADO',
        users: {
          updateMany: { where: { messageId: id }, data: { ...this.dataDone } },
        },
      },
    });
    return done;
  }

  public static async quantityFiles(userId: Users['id']) {
    const quantity = await prisma.messages.groupBy({
      by: ['type'],
      _count: { type: true },
      where: {
        users: {
          some: { userId },
        },
      },
    });
    return quantity;
  }
}
export default MailServices;
