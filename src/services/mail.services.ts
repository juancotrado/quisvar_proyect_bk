import { Mail, Messages, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import {
  FileMessagePick,
  ParametersMail,
  PickMail,
  PickMessageReply,
} from 'types/types';
import Queries from '../utils/queries';
import AppError from '../utils/appError';

class MailServices {
  public static async getByUser(
    userId: Users['id'],
    { skip, type, status, typeMessage }: ParametersMail
  ) {
    const mail = await prisma.mail.findMany({
      where: {
        userId,
        type,
        message: { type: typeMessage, status },
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

  public static async getMessagePreview(id: Messages['id']) {
    if (!id) throw new AppError('Ops!, ID invalido', 400);
    const getMessage = await prisma.messages.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        header: true,
        description: true,
        type: true,
        createdAt: true,
        files: { select: { id: true, name: true, path: true } },
      },
    });
    if (!getMessage)
      throw new AppError('No se pudo encontrar datos del mensaje', 404);
    return getMessage;
  }

  // public static async create(
  //   {
  //     title,
  //     description,
  //     type,
  //     header,
  //     senderId,
  //     receiverId,
  //     secondaryReceiver,
  //   }: PickMail,
  //   files: FileMessagePick[]
  // ) {
  //   const typeMail: Mail['type'] = 'SENDER';
  //   const role: Mail['role'] = 'MAIN';
  //   const status = true;
  //   const createMessage = await prisma.messages.create({
  //     data: {
  //       title,
  //       header,
  //       description,
  //       type,
  //       users: {
  //         createMany: {
  //           data: [
  //             ...secondaryReceiver,
  //             { userId: senderId, role, type: typeMail, userInit: true },
  //             { userId: receiverId, role, status },
  //           ],
  //           skipDuplicates: true,
  //         },
  //       },
  //       files: { createMany: { data: files } },
  //     },
  //   });
  //   return createMessage;
  // }

  // public static async createReply(
  //   {
  //     title,
  //     receiverId,
  //     senderId,
  //     header,
  //     description,
  //     status,
  //     messageId,
  //   }: PickMessageReply,
  //   files: Pick<FileMessagePick, 'name' | 'path'>[]
  // ) {
  //   if (!receiverId || !senderId)
  //     throw new AppError('Ingrese Destinatario', 400);
  //   if (status === 'RECHAZADO') {
  //     await prisma.messages.update({
  //       where: { id: messageId },
  //       data: { status },
  //     });
  //     //------------------------------------------------------------------
  //     const uno = await prisma.mail.update({
  //       where: { userId_messageId: { messageId, userId: senderId } },
  //       data: { type: 'SENDER', status: false },
  //     });
  //     const dos = await prisma.mail.update({
  //       where: { userId_messageId: { messageId, userId: receiverId } },
  //       data: { type: 'RECEIVER', status: true },
  //     });
  //     console.log(uno, dos);

  //     //------------------------------------------------------------------
  //     const createReply = await prisma.messageHistory.create({
  //       data: {
  //         title,
  //         header,
  //         description,
  //         user: { connect: { id: senderId } },
  //         message: { connect: { id: messageId } },
  //         files: { createMany: { data: files } },
  //       },
  //     });
  //     return createReply;
  //   }
  //   //------------------------------------------------------------------
  //   if (status === 'PROCESO') {
  //     await prisma.messages.update({
  //       where: { id: messageId },
  //       data: { status },
  //     });
  //   }
  //   await prisma.mail.upsert({
  //     where: {
  //       userId_messageId: {
  //         messageId,
  //         userId: receiverId,
  //       },
  //     },
  //     update: {
  //       type: 'RECEIVER',
  //       role: 'MAIN',
  //       status: true,
  //     },
  //     create: {
  //       messageId,
  //       userId: receiverId,
  //       type: 'RECEIVER',
  //       role: 'MAIN',
  //       status: true,
  //     },
  //   });
  //   await prisma.mail.update({
  //     where: { userId_messageId: { messageId, userId: senderId } },
  //     data: { type: 'SENDER', status: false, role: 'MAIN' },
  //   });
  //   const createForward = await prisma.messageHistory.create({
  //     data: {
  //       title,
  //       header,
  //       description,
  //       user: { connect: { id: senderId } },
  //       message: { connect: { id: messageId } },
  //       files: { createMany: { data: files } },
  //     },
  //   });
  //   return createForward;
  // }

  // public static async updateMessage(
  //   id: Messages['id'],
  //   {
  //     header,
  //     title,
  //     description,
  //     senderId,
  //     receiverId,
  //   }: Messages & { senderId: number; receiverId: number },
  //   files: FileMessagePick[]
  // ) {
  //   if (!receiverId || !senderId)
  //     throw new AppError('Ingrese Destinatario', 400);
  //   const updateMessage = await prisma.messages.update({
  //     where: { id },
  //     data: {
  //       header,
  //       title,
  //       description,
  //       status: 'PROCESO',
  //       files: { createMany: { data: files } },
  //     },
  //   });
  //   //------------------------------------------------------------------
  //   await prisma.mail.update({
  //     where: { userId_messageId: { messageId: id, userId: senderId } },
  //     data: { type: 'SENDER', status: false },
  //   });
  //   await prisma.mail.update({
  //     where: { userId_messageId: { messageId: id, userId: receiverId } },
  //     data: { type: 'RECEIVER', status: true },
  //   });
  //   //------------------------------------------------------------------

  //   return updateMessage;
  // }

  // public static async archived(id: Messages['id'], senderId: number) {
  //   const archived = await prisma.messages.update({
  //     where: { id },
  //     data: { status: 'ARCHIVADO' },
  //   });
  //   await prisma.mail.updateMany({
  //     where: { messageId: id },
  //     data: { status: false },
  //   });
  //   //------------------------------------------------------------------
  //   await prisma.mail.updateMany({
  //     where: { messageId: id, role: 'MAIN' },
  //     data: { type: 'RECEIVER' },
  //   });
  //   await prisma.mail.update({
  //     where: { userId_messageId: { messageId: id, userId: senderId } },
  //     data: { type: 'SENDER' },
  //   });
  //   //------------------------------------------------------------------
  //   return archived;
  // }

  // public static async done(
  //   id: Messages['id'],
  //   senderId: number,
  //   paymentPdfData: string
  // ) {
  //   if (!id) throw new AppError('Ops, ID invalido', 400);
  //   if (!senderId) throw new AppError('Ingrese Destinatario', 400);
  //   const done = await prisma.messages.update({
  //     where: { id },
  //     data: { status: 'FINALIZADO', paymentPdfData },
  //   });
  //   //------------------------------------------------------------------
  //   await prisma.mail.updateMany({
  //     where: { messageId: id },
  //     data: { type: 'RECEIVER', role: 'SECONDARY', status: false },
  //   });
  //   //------------------------------------------------------------------
  //   const getFirst = await prisma.mail.findFirst({
  //     where: { messageId: id },
  //     orderBy: { assignedAt: 'asc' },
  //   });
  //   if (!getFirst) throw new AppError('error', 400);
  //   //------------------------------------------------------------------
  //   await prisma.mail.update({
  //     where: { userId_messageId: { messageId: id, userId: senderId } },
  //     data: { type: 'SENDER', role: 'MAIN' },
  //   });
  //   await prisma.mail.update({
  //     where: { userId_messageId: { messageId: id, userId: getFirst.userId } },
  //     data: { type: 'RECEIVER', role: 'MAIN' },
  //   });
  //   return done;
  // }

  // public static async updateStatus(
  //   id: Messages['id'],
  //   status: Messages['status']
  // ) {
  //   const updateStatus = await prisma.messages.update({
  //     where: { id },
  //     data: { status },
  //   });
  //   return updateStatus;
  // }

  // public static async archivedItem(messageId: Messages['id']) {
  //   const archivedList = await prisma.mail.updateMany({
  //     where: { messageId, type: 'RECEIVER' },
  //     data: { status: false },
  //   });
  //   return archivedList;
  // }

  // public static async quantityFiles(userId: Users['id']) {
  //   const quantity = await prisma.messages.groupBy({
  //     by: ['type'],
  //     _count: { type: true },
  //     where: {
  //       users: {
  //         some: { userId },
  //       },
  //     },
  //   });
  //   return quantity;
  // }
}
export default MailServices;
