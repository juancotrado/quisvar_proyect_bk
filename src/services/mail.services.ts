import { Mail, Messages, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import { ParametersMail, PickMail } from 'types/types';
import Queries from '../utils/queries';
import AppError from '../utils/appError';

class MailServices {
  static async getByUser(
    userId: Users['id'],
    { skip, limit, type, status }: ParametersMail
  ) {
    const take = limit ? limit : 10;
    const getListMail = await prisma.mail.findMany({
      where: { userId, type, status },
      orderBy: { assignedAt: 'desc' },
      skip,
      take,
      select: {
        messageId: true,
        status: true,
        message: true,
        // message: {
        //   select: {
        //     id: true,
        //     description: true,
        //     idMessageReply: true,
        //     idMessageResend: true,
        //     // users: {
        //     //   select: {
        //     //     userId: true,
        //     //     type: true,
        //     //     user: Queries.selectProfileUser,
        //     //   },
        //     // },
        //     createdAt: true,
        //     // files: { select: { id: true, name: true, path: true } },
        //   },
        // },
      },
    });
    return getListMail;
  }
  static async getMessage(id: Messages['id']) {
    if (!id) throw new AppError('Ops!, ID invalido', 400);
    const getMessage = await prisma.messages.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        description: true,
        type: true,
        idMessageReply: true,
        idMessageResend: true,
        users: {
          select: {
            userId: true,
            type: true,
            user: Queries.selectProfileUser,
          },
        },
        createdAt: true,
        files: { select: { id: true, name: true, path: true } },
      },
    });
    if (!getMessage)
      throw new AppError('No se pudo encontrar datos del mensaje', 404);
    const { idMessageReply, idMessageResend, ...message } = getMessage;
    const previewMessage = idMessageReply
      ? await this.getMessagePreview(idMessageReply)
      : idMessageResend
      ? await this.getMessagePreview(idMessageResend)
      : null;
    const data = { ...message, previewMessage };
    return data;
  }

  static async getMessagePreview(id: Messages['id']) {
    if (!id) throw new AppError('Ops!, ID invalido', 400);
    const getMessage = await prisma.messages.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
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

  static async create({
    title,
    description,
    type,
    senderId,
    receiverId,
    idMessageReply,
    idMessageResend,
  }: PickMail) {
    const typeMail: Mail['type'] = 'SENDER';
    const createMessage = await prisma.messages.create({
      data: {
        title,
        description,
        type,
        idMessageReply,
        idMessageResend,
        users: {
          createMany: {
            data: [
              { userId: senderId, type: typeMail },
              { userId: receiverId },
            ],
            skipDuplicates: true,
          },
        },
        files: {
          createMany: {
            data: [{ name: '', path: '' }],
          },
        },
      },
    });
    return createMessage;
  }
  static async updateStatus(id: Messages['id'], status: boolean) {
    const updateStatus = await prisma.messages.update({
      where: { id },
      data: { status },
    });
    return updateStatus;
  }
  static async archived(messageId: Messages['id']) {
    const archivedList = await prisma.mail.updateMany({
      where: { messageId, type: 'RECEIVER' },
      data: { status: false },
    });
    return archivedList;
  }
}
export default MailServices;
