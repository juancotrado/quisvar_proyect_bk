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
  static PickType(type?: Mail['type']) {
    if (type === 'SENDER') return 'RECEIVER' as Mail['type'];
    if (type === 'RECEIVER') return 'SENDER' as Mail['type'];
    return undefined;
  }
  static async getByUser(
    userId: Users['id'],
    { skip, type, status, typeMessage }: ParametersMail
  ) {
    const typeMail = this.PickType(type);
    const mail = await prisma.mail.findMany({
      where: { userId, type, message: { status, type: typeMessage } },
      orderBy: { assignedAt: 'desc' },
      skip,
      take: 20,
      select: {
        messageId: true,
        status: true,
        type: true,
        message: {
          select: {
            id: true,
            header: true,
            status: true,
            type: true,
            title: true,
            createdAt: true,
            users: {
              where: { type: typeMail, role: 'MAIN' },
              select: {
                type: true,
                role: true,
                status: true,
                user: Queries.selectProfileUser,
              },
            },
          },
        },
      },
    });
    const total = await prisma.mail.count({
      where: { userId, type, message: { status, type: typeMessage } },
    });
    return { total, mail };
  }
  static async getMessage(id: Messages['id']) {
    if (!id) throw new AppError('Ops!, ID invalido', 400);
    const getMessage = await prisma.messages.findUnique({
      where: { id },
      include: {
        users: {
          select: {
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
    return getMessage;
  }

  static async getMessagePreview(id: Messages['id']) {
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

  static async create(
    {
      title,
      description,
      type,
      header,
      senderId,
      receiverId,
      secondaryReceiver,
    }: PickMail,
    files: FileMessagePick[]
  ) {
    const typeMail: Mail['type'] = 'SENDER';
    const role: Mail['role'] = 'MAIN';
    const status = true;
    const createMessage = await prisma.messages.create({
      data: {
        title,
        header,
        description,
        type,
        users: {
          createMany: {
            data: [
              ...secondaryReceiver,
              { userId: senderId, role, type: typeMail },
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
  static async createReply(
    {
      title,
      receiverId,
      senderId,
      header,
      description,
      status,
      messageId,
    }: PickMessageReply,
    files: Pick<FileMessagePick, 'name' | 'path'>[]
  ) {
    if (status === 'RECHAZADO') {
      await prisma.messages.update({
        where: { id: messageId },
        data: { status },
      });
      const createReply = await prisma.messageHistory.create({
        data: {
          title,
          header,
          description,
          user: { connect: { id: senderId } },
          message: { connect: { id: messageId } },
          files: { createMany: { data: files } },
        },
      });
      return createReply;
    }
    if (!receiverId) throw new AppError('Ingrese Destinatario', 400);
    console.log(title, receiverId, senderId, header, status, messageId);
    // const updatePriorityReceiver =
    await prisma.mail.create({
      data: { messageId, userId: receiverId, role: 'MAIN', status: true },
    });
    // const updateStatusSender =
    await prisma.mail.update({
      where: { userId_messageId: { userId: senderId, messageId } },
      data: { status: false },
    });
    const createForward = await prisma.messageHistory.create({
      data: {
        title,
        header,
        description,
        user: { connect: { id: senderId } },
        message: { connect: { id: messageId } },
        files: { createMany: { data: files } },
      },
    });
    return createForward;
  }
  static async updateMessage(
    id: Messages['id'],
    { header, title, description }: Messages,
    files: FileMessagePick[]
  ) {
    const updateMessage = await prisma.messages.update({
      where: { id },
      data: {
        header,
        title,
        description,
        status: 'PROCESO',
        files: { createMany: { data: files } },
      },
    });
    return updateMessage;
  }
  static async archived(id: Messages['id']) {
    const archived = await prisma.messages.update({
      where: { id },
      data: { status: 'ARCHIVADO' },
    });
    await prisma.mail.updateMany({
      where: { messageId: id },
      data: { status: false },
    });
    return archived;
  }
  static async done(id: Messages['id']) {
    if (!id) throw new AppError('Ops, ID invalido', 400);
    const done = await prisma.messages.update({
      where: { id },
      data: { status: 'FINALIZADO' },
    });
    await prisma.mail.updateMany({
      where: { messageId: id },
      data: { status: false },
    });
    return done;
  }
  static async updateStatus(id: Messages['id'], status: Messages['status']) {
    const updateStatus = await prisma.messages.update({
      where: { id },
      data: { status },
    });
    return updateStatus;
  }
  static async archivedItem(messageId: Messages['id']) {
    const archivedList = await prisma.mail.updateMany({
      where: { messageId, type: 'RECEIVER' },
      data: { status: false },
    });
    return archivedList;
  }
  static async quantityFiles(userId: Users['id']) {
    const quantity = await prisma.messages.groupBy({
      by: ['type'],
      _count: { type: true },
      where: {
        // status: true,
        users: {
          some: { userId },
        },
      },
    });
    return quantity;
  }
}
export default MailServices;
