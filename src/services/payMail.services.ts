import { FilesPayment, PayMail, PayMessages, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import {
  FileMessagePick,
  ParametersPayMail,
  PickPayMail,
  PickPayMessageReply,
  ReceiverT,
} from 'types/types';
import Queries from '../utils/queries';
import AppError from '../utils/appError';

class PayMailServices {
  public static PickType(type?: PayMail['type']): PayMail['type'] | undefined {
    if (type === 'SENDER') return 'RECEIVER';
    if (type === 'RECEIVER') return 'SENDER';
    return undefined;
  }

  public static async getByUser(
    userId: Users['id'],
    { skip, type, status, typeMessage }: ParametersPayMail
  ) {
    // const typeMail = this.PickType(type);
    const mail = await prisma.payMail.findMany({
      where: {
        userId,
        type,
        paymessage: { type: typeMessage, status },
      },
      orderBy: { paymessage: { updatedAt: 'desc' } },
      skip,
      take: 20,
      select: {
        paymessageId: true,
        status: true,
        type: true,
        paymessage: Queries.PayMail().selectMessage('MAIN'),
      },
    });
    const parseList = mail.map(({ paymessage, ...data }) => {
      const userInit = paymessage.users.find(user => user.userInit);
      const _message = { ...paymessage, userInit };
      return { ...data, message: _message };
    });
    const total = await prisma.payMail.count({
      where: { userId, type, paymessage: { status, type: typeMessage } },
    });
    return { total, mail: parseList };
  }

  static async getMessage(id: PayMessages['id']) {
    if (!id) throw new AppError('Ops!, ID invalido', 400);
    const getMessage = await prisma.payMessages.findUnique({
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
        filesPay: {
          select: {
            files: true,
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
    const userInit = getMessage.users.find(user => user.userInit);
    return { ...getMessage, userInit };
  }

  static async getMessagePreview(id: PayMessages['id']) {
    if (!id) throw new AppError('Ops!, ID invalido', 400);
    const getPayMessage = await prisma.payMessages.findUnique({
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
    if (!getPayMessage)
      throw new AppError('No se pudo encontrar datos del mensaje', 404);
    return getPayMessage;
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
    }: PickPayMail,
    files: FileMessagePick[]
  ) {
    const typeMail: PayMail['type'] = 'SENDER';
    const role: PayMail['role'] = 'MAIN';
    const status: PayMail['status'] = true;
    const createPayMessage = await prisma.payMessages.create({
      data: {
        title,
        header,
        description,
        type,
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
    return createPayMessage;
  }

  static async createReply(
    {
      title,
      receiverId,
      senderId,
      header,
      description,
      status,
      paymessageId: id,
    }: PickPayMessageReply,
    files: Pick<FileMessagePick, 'name' | 'path'>[]
  ) {
    if (!receiverId || !senderId)
      throw new AppError('Ingrese Destinatario', 400);
    const receiv: ReceiverT = { type: 'RECEIVER', role: 'MAIN', status: true };
    await prisma.payMail.update({
      where: { userId_paymessageId: { paymessageId: id, userId: senderId } },
      data: { type: 'SENDER', status: false },
    });
    if (status === 'RECHAZADO') {
      await prisma.payMail.updateMany({
        where: { userInit: true },
        data: { ...receiv },
      });
    } else {
      await prisma.payMail.upsert({
        where: {
          userId_paymessageId: { paymessageId: id, userId: receiverId },
        },
        update: { ...receiv },
        create: { paymessageId: id, userId: receiverId, ...receiv },
      });
    }
    //------------------------------------------------------------------
    await prisma.payMessages.update({ where: { id }, data: { status } });
    const createForward = await prisma.messageHistory.create({
      data: {
        title,
        header,
        description,
        user: { connect: { id: senderId } },
        paymessage: { connect: { id } },
        files: { createMany: { data: files } },
      },
    });
    return createForward;
  }

  static async updateMessage(
    id: PayMessages['id'],
    {
      header,
      title,
      description,
      senderId,
      receiverId,
    }: PayMessages & { senderId: number; receiverId: number },
    files: FileMessagePick[]
  ) {
    if (!receiverId || !senderId)
      throw new AppError('Ingrese Destinatario', 400);
    const updateMessage = await prisma.payMessages.update({
      where: { id },
      data: {
        header,
        title,
        description,
        status: 'PROCESO',
        files: { createMany: { data: files } },
      },
    });
    //------------------------------------------------------------------
    await prisma.payMail.update({
      where: { userId_paymessageId: { paymessageId: id, userId: senderId } },
      data: { type: 'SENDER', status: false },
    });
    await prisma.payMail.update({
      where: { userId_paymessageId: { paymessageId: id, userId: receiverId } },
      data: { type: 'RECEIVER', status: true },
    });
    //------------------------------------------------------------------

    return updateMessage;
  }

  static async archived(id: PayMessages['id'], senderId: number) {
    const archived = await prisma.payMessages.update({
      where: { id },
      data: { status: 'ARCHIVADO' },
    });
    await prisma.payMail.updateMany({
      where: { paymessageId: id },
      data: { status: false },
    });
    //------------------------------------------------------------------
    await prisma.payMail.updateMany({
      where: { paymessageId: id, role: 'MAIN' },
      data: { type: 'RECEIVER' },
    });
    await prisma.payMail.update({
      where: { userId_paymessageId: { paymessageId: id, userId: senderId } },
      data: { type: 'SENDER' },
    });
    //------------------------------------------------------------------
    return archived;
  }

  static async done(
    id: PayMessages['id'],
    senderId: number,
    paymentPdfData: string
  ) {
    if (!id) throw new AppError('Ops, ID invalido', 400);
    if (!senderId) throw new AppError('Ingrese Destinatario', 400);
    const done = await prisma.payMessages.update({
      where: { id },
      data: { status: 'FINALIZADO', paymentPdfData },
    });
    //------------------------------------------------------------------
    await prisma.payMail.updateMany({
      where: { paymessageId: id },
      data: { type: 'RECEIVER', role: 'SECONDARY', status: false },
    });
    //------------------------------------------------------------------
    await prisma.payMail.update({
      where: { userId_paymessageId: { paymessageId: id, userId: senderId } },
      data: { type: 'SENDER', role: 'MAIN' },
    });
    await prisma.payMail.updateMany({
      where: { userInit: true },
      data: { type: 'RECEIVER', role: 'MAIN' },
    });
    return done;
  }

  static async updateStatus(
    id: PayMessages['id'],
    status: PayMessages['status']
  ) {
    const updateStatus = await prisma.payMessages.update({
      where: { id },
      data: { status },
    });
    return updateStatus;
  }

  static async archivedItem(paymessageId: PayMessages['id']) {
    const archivedList = await prisma.payMail.updateMany({
      where: { paymessageId, type: 'RECEIVER' },
      data: { status: false },
    });
    return archivedList;
  }

  static async quantityFiles(userId: Users['id']) {
    const quantity = await prisma.payMessages.groupBy({
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
  static async createVoucher(
    id: PayMessages['id'],
    { senderId }: { senderId: number },
    files: Pick<FilesPayment, 'name' | 'path'>[]
  ) {
    //------------------------------------------------------------------
    const getReceiver = await prisma.payMail.findFirst({
      where: { paymessageId: id, type: 'SENDER', role: 'MAIN' },
    });
    if (!getReceiver) throw new AppError('error', 400);
    const { userId: receiverId } = getReceiver;
    //------------------------------------------------------------------
    const newVoucher = await prisma.payMessages.update({
      where: { id },
      data: {
        status: 'POR_PAGAR',
        filesPay: {
          create: { files: { createMany: { data: files } } },
        },
      },
    });
    //------------------------------------------------------------------
    await prisma.payMail.update({
      where: { userId_paymessageId: { paymessageId: id, userId: senderId } },
      data: { type: 'SENDER' },
    });
    await prisma.payMail.update({
      where: { userId_paymessageId: { paymessageId: id, userId: receiverId } },
      data: { type: 'RECEIVER' },
    });
    //------------------------------------------------------------------
    return newVoucher;
  }

  static async updateVoucher(
    id: PayMessages['id'],
    { status, senderId }: Pick<PayMessages, 'status'> & { senderId: number }
  ) {
    if (!['FINALIZADO', 'PAGADO'].includes(status))
      throw new AppError('Ingrese un estado valido para este proceso', 400);
    const denied = await prisma.payMessages.update({
      where: { id },
      data: { status },
    });
    //------------------------------------------------------------------
    const getReceiver = await prisma.payMail.findFirst({
      where: { paymessageId: id, type: 'SENDER', role: 'MAIN' },
    });
    if (!getReceiver) throw new AppError('error', 400);
    const { userId: receiverId } = getReceiver;
    //------------------------------------------------------------------
    await prisma.payMail.update({
      where: { userId_paymessageId: { paymessageId: id, userId: senderId } },
      data: { type: 'SENDER' },
    });
    await prisma.payMail.update({
      where: { userId_paymessageId: { paymessageId: id, userId: receiverId } },
      data: { type: 'RECEIVER' },
    });
    //------------------------------------------------------------------
    // if (status == 'FINALIZADO' && denied.voucher) {
    //   unlinkSync(denied.voucher);
    //   await prisma.messages.update({ where: { id }, data: { voucher: null } });
    // }
    return denied;
  }
}
export default PayMailServices;
