import { FilesPayment, PayMail, PayMessages, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import lodash from 'lodash';
import {
  FileMessagePick,
  ParametersPayMail,
  PickPayMail,
  PickPayMessageReply,
  PickSealPayMessage,
  ReceiverT,
  ReceiverTypePick,
} from 'types/types';
import Queries from '../utils/queries';
import AppError from '../utils/appError';
import GenerateFiles from '../utils/generateFile';
import { UserType } from '../middlewares/auth.middleware';

class PayMailServices {
  public static PickType(type?: PayMail['type']): PayMail['type'] | undefined {
    if (type === 'SENDER') return 'RECEIVER';
    if (type === 'RECEIVER') return 'SENDER';
    return undefined;
  }

  public static async onHolding({
    offset: skip,
    officeId,
    limit: take,
    typeMessage,
    status,
    onHolding,
  }: ParametersPayMail) {
    const total = await prisma.payMessages.count({
      where: { officeId, status, type: typeMessage, onHolding },
    });
    const mailList = await prisma.payMessages.findMany({
      where: { officeId, status, type: typeMessage, onHolding },
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
      ...Queries.PayMail().selectMessage('MAIN'),
    });
    const mail = { total, mailList };
    return mail;
  }

  public static async changeHoldingStatus(ids: number[]) {
    const now = new Date();
    const mailListUpdate = await prisma.payMessages.updateMany({
      where: { id: { in: ids } },
      data: { onHolding: false, onHoldingDate: now },
    });
    return mailListUpdate;
  }

  public static async getByUser(
    { id: userId }: UserType,
    {
      type,
      status,
      typeMessage,
      officeId,
      offset: skip,
      limit: take,
    }: ParametersPayMail
  ) {
    const onHolding = type === 'SENDER' ? undefined : false;
    //----------------------------------------------------------------
    const userFindByOffice = officeId
      ? await prisma.userToOffice.findUnique({
          where: { usersId_officeId: { officeId, usersId: userId } },
        })
      : null;
    const managerOffice = officeId
      ? await prisma.office.findUnique({
          where: { id: officeId },
          select: { users: { where: { isOfficeManager: true }, take: 1 } },
        })
      : null;
    if (officeId && !managerOffice)
      throw new AppError('Error, oficina, sin gerente', 404);
    const historyOfficesIds = userFindByOffice
      ? { hasSome: [userFindByOffice.officeId] }
      : undefined;
    //----------------------------------------------------------------
    const newUser = officeId ? managerOffice?.users[0].usersId : userId;
    const mailList = await prisma.payMail.findMany({
      where: {
        userId: newUser,
        type,
        paymessage: {
          type: typeMessage,
          status: status ? status : { not: 'ARCHIVADO' },
          onHolding,
          historyOfficesIds,
        },
      },
      skip,
      orderBy: { paymessage: { updatedAt: 'desc' } },
      take,
      select: {
        paymessageId: true,
        status: true,
        type: true,
        userInit: true,
        paymessage: Queries.PayMail().selectMessage('MAIN'),
      },
    });
    const parseList = mailList.map(({ paymessage, ...data }) => {
      const userInit = paymessage.users.find(user => user.userInit);
      const _message = { ...paymessage, userInit };
      return { ...data, paymessage: _message };
    });
    const total = await prisma.payMail.count({
      where: {
        userId: newUser,
        type,
        paymessage: {
          type: typeMessage,
          status: status ? status : { not: 'ARCHIVADO' },
          onHolding,
          historyOfficesIds,
        },
      },
    });
    return { total, mailList: parseList };
  }

  static async getMessageShort(id: PayMessages['id']) {
    if (!id) throw new AppError('Ops!, ID invalido', 400);
    const getMessage = await prisma.payMessages.findUnique({
      where: { id },
      include: {
        office: {
          select: { name: true, quantity: true },
        },
        files: {
          where: { name: { startsWith: 'mp' } },
          orderBy: { attempt: 'desc' },
          take: 1,
        },
      },
    });
    if (!getMessage) throw new AppError('Ops!, ID invalido', 400);
    return getMessage;
  }

  static async getMessage(
    id: PayMessages['id'],
    dataUser: UserType,
    officeId?: number
  ) {
    if (!id) throw new AppError('Ops!, ID invalido', 400);
    if (officeId === 0) throw new AppError('Ops!, officina inválida', 400);
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
          orderBy: { id: 'asc' },
          select: { id: true, name: true, path: true, attempt: true },
        },
        history: {
          include: {
            files: {
              orderBy: { id: 'asc' },
              select: { id: true, name: true, path: true },
            },
            user: Queries.selectProfileUser,
          },
        },
        office: { select: { id: true, name: true, quantity: true } },
      },
    });
    if (!getMessage)
      throw new AppError('No se pudo encontrar datos del mensaje', 404);
    //---------------------------------------------------------------------
    const isUserOnOffice = officeId
      ? await prisma.userToOffice.findUnique({
          where: {
            usersId_officeId: { usersId: dataUser.id, officeId },
          },
          select: {
            office: {
              select: {
                name: true,
                users: { where: { isOfficeManager: true } },
              },
            },
          },
        })
      : null;
    let users = [];
    //---------------------------------------------------------------------
    if (isUserOnOffice) {
      const userSessionData = lodash.pick(dataUser, ['id', 'ruc', 'address']);
      const profile = lodash.pick(dataUser.profile, [
        'firstName',
        'lastName',
        'dni',
        'degree',
        'description',
        'job',
      ]);
      const userSession = { ...userSessionData, profile };
      const managerUser = isUserOnOffice.office.users[0];
      if (!managerUser)
        throw new AppError('Error, gerente de oficina no encontrado', 404);
      const manager = getMessage.users.find(
        ({ userId }) => userId === managerUser.usersId
      );
      if (!manager)
        throw new AppError('Error, gerente de oficina inexistente', 404);
      const keys = ['role', 'type', 'userInit', 'status'];
      const dataManager = lodash.pick(manager, keys);
      const parseUsers = getMessage.users.filter(
        ({ userId }) => userId !== dataUser.id
      );
      const userWithOffice = {
        ...dataManager,
        userId: dataUser.id,
        user: userSession,
      };
      users = [...parseUsers, userWithOffice];
    } else {
      users = [...getMessage.users];
    }
    const userInit = getMessage.users.find(user => user.userInit);
    return { ...getMessage, userInit, users };
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
      officeId,
      receiverId,
      secondaryReceiver,
    }: PickPayMail,
    files: FileMessagePick[]
  ) {
    const typeMail: PayMail['type'] = 'SENDER';
    const role: PayMail['role'] = 'MAIN';
    const status: PayMail['status'] = true;
    const getUserOffice = officeId
      ? await prisma.office.findUnique({
          where: { id: officeId },
          select: {
            users: {
              where: { isOfficeManager: true },
              select: { usersId: true },
              take: 1,
            },
          },
        })
      : null;
    const receiverList: ReceiverTypePick[] = getUserOffice
      ? [{ userId: getUserOffice.users[0].usersId, role, status }]
      : [{ userId: receiverId, role, status }];
    const historyOfficesIds = getUserOffice ? [officeId] : [];
    const createPayMessage = await prisma.payMessages.create({
      data: {
        title,
        header,
        description,
        type,
        officeId,
        historyOfficesIds,
        users: {
          createMany: {
            data: [
              ...secondaryReceiver,
              ...receiverList,
              { userId: senderId, role, type: typeMail, userInit: true },
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
      status,
      officeId,
      paymessageId: id,
    }: PickPayMessageReply,
    files: Pick<FileMessagePick, 'name' | 'path'>[]
  ) {
    const receiv: ReceiverT = { type: 'RECEIVER', role: 'MAIN', status: true };
    //-------------------------- Set New Office ---------------------------------
    const getOffice = officeId
      ? await prisma.office.findUnique({
          where: { id: officeId },
          select: {
            id: true,
            users: {
              where: { isOfficeManager: true },
              select: { usersId: true },
              take: 1,
            },
          },
        })
      : null;
    //---------------------------------------------------------------------------
    const getSender = await prisma.payMessages.findUnique({
      where: { id },
      select: {
        historyOfficesIds: true,
        office: {
          select: {
            id: true,
            users: {
              where: { isOfficeManager: true },
              select: { usersId: true },
              take: 1,
            },
          },
        },
      },
    });

    if (getSender?.office && getSender?.office?.id === officeId)
      throw new AppError('No puedes mandar a la misma oficina', 500);
    //---------------------------------------------------------------------------

    const newReceiver = getOffice ? getOffice.users[0].usersId : receiverId;
    const newSender = getSender?.office
      ? getSender.office.users[0].usersId
      : senderId;
    if (getOffice) {
      const existOffice = getSender?.historyOfficesIds.find(
        id => id === getOffice.id
      );
      const historyOfficesIds = existOffice
        ? undefined
        : [...(getSender?.historyOfficesIds ?? []), getOffice.id];
      await prisma.payMessages.update({
        where: { id },
        data: {
          officeId,
          historyOfficesIds,
        },
      });
    }
    //---------------------------------------------------------------------------
    if (!newReceiver || !newSender)
      throw new AppError('Ingrese Destinatario', 400);
    if (status === 'RECHAZADO') {
      await prisma.payMail.update({
        where: {
          userId_paymessageId: { paymessageId: id, userId: newReceiver },
        },
        data: { ...receiv },
      });
    } else {
      await prisma.payMail.upsert({
        where: {
          userId_paymessageId: { paymessageId: id, userId: newReceiver },
        },
        update: { ...receiv },
        create: { paymessageId: id, userId: newReceiver, ...receiv },
      });
    }
    //------------------------------------------------------------------
    await prisma.payMail.update({
      where: { userId_paymessageId: { paymessageId: id, userId: newSender } },
      data: { type: 'SENDER', status: false },
    });
    await prisma.payMessages.update({ where: { id }, data: { status } });
    const createForward = await prisma.messageHistory.create({
      data: {
        title,
        header,
        user: { connect: { id: senderId } },
        paymessage: { connect: { id } },
        files: { createMany: { data: files } },
      },
    });
    return createForward;
  }

  static async updateDataWithSeal(
    {
      title,
      officeId,
      paymessageId: id,
      numberPage,
      observations,
      to,
    }: // ...data
    PickSealPayMessage,
    files: Pick<FileMessagePick, 'name' | 'path'>[],
    senderId: number
  ) {
    const receiv: ReceiverT = { type: 'RECEIVER', role: 'MAIN', status: true };
    //-------------------------- Set New Office ---------------------------------
    const getOffice = await prisma.office.findUnique({
      where: { id: officeId },
      select: {
        name: true,
        users: {
          where: { isOfficeManager: true },
          select: { usersId: true },
          take: 1,
        },
      },
    });
    //---------------------------------------------------------------------------
    const getSender = await prisma.payMessages.findUnique({
      where: { id },
      select: {
        id: true,
        positionSeal: true,
        historyOfficesIds: true,
        files: {
          where: { name: { startsWith: 'mp' } },
          orderBy: { attempt: 'desc' },
          take: 1,
        },
        office: {
          select: {
            id: true,
            quantity: true,
            name: true,
            users: {
              where: { isOfficeManager: true },
              select: { usersId: true },
              take: 1,
            },
          },
        },
      },
    });
    //---------------------------------------------------------------------------
    if (!getSender || !getSender.office)
      throw new AppError('Error, no existe oficina oficina', 500);
    if (!getOffice || !getOffice.users)
      throw new AppError('Error, no existe oficina oficina', 500);
    if (getSender?.office && getSender.office?.id === officeId)
      throw new AppError('No puedes mandar a la misma oficina', 500);
    //---------------------------------------------------------------------------
    const newReceiver = getOffice.users[0].usersId;
    const newSender = getSender.office.users[0].usersId;
    //---------------------------------------------------------------------------
    if (!newReceiver || !newSender)
      throw new AppError('Ingrese Destinatario', 400);
    const quantitySeal = numberPage
      ? +numberPage
      : getSender.office?.quantity + 1;
    const positionSeal = getSender.positionSeal;
    //---------------------------------------------------------------------------
    await prisma.payMail.upsert({
      where: {
        userId_paymessageId: { paymessageId: id, userId: newReceiver },
      },
      update: { ...receiv },
      create: { paymessageId: id, userId: newReceiver, ...receiv },
    });
    await prisma.payMail.update({
      where: { userId_paymessageId: { paymessageId: id, userId: newSender } },
      data: { type: 'SENDER', status: false },
    });
    //-------------------------------------------------------------------
    const { historyOfficesIds: listOfficeIds } = getSender;
    const existOffice = listOfficeIds.find(id => id === officeId);
    const historyOfficesIds = existOffice
      ? undefined
      : [...listOfficeIds, officeId];
    //---------------------------------------------------------------------------
    await prisma.payMessages.update({
      where: { id: getSender.id },
      data: {
        officeId,
        historyOfficesIds,
        positionSeal: positionSeal + 1,
      },
    });
    await prisma.office.update({
      where: { id: getSender.office.id },
      data: { quantity: quantitySeal + 1 },
    });
    //-------------------------------------------------------------------
    const { name, path } = getSender.files[0];
    const destinityFile = path + '/' + name;
    const dateSeal = new Date().toISOString().split('T')[0];
    const parseDateSeal = dateSeal.split('-').reverse().join('-');
    //-------------------------------------------------------------------
    await GenerateFiles.coverFirma(destinityFile, destinityFile, {
      date: parseDateSeal,
      pos: positionSeal,
      to: to,
      observation: observations,
      title: getSender.office.name,
      numberPage: numberPage ? numberPage : quantitySeal,
    });
    //-------------------------------------------------------------------
    const createForward = await prisma.messageHistory.create({
      data: {
        title: title,
        header: '(proveido)/' + getSender.office.name,
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

  static async archivedList({ ids }: { ids: PayMessages['id'][] }) {
    const updateList = ids.map(id => {
      const archived = prisma.payMessages.update({
        where: { id },
        data: {
          status: 'ARCHIVADO',
          users: {
            updateMany: {
              where: { paymessageId: id },
              data: { type: 'RECEIVER', status: false },
            },
          },
        },
      });
      return archived;
    });
    return await prisma.$transaction(updateList);
  }

  static async done(
    id: PayMessages['id'],
    senderId: number,
    {
      paymentPdfData,
      companyId,
      ordenNumber,
    }: { paymentPdfData: string; ordenNumber: number; companyId: number }
  ) {
    if (!id) throw new AppError('Ops, ID invalido', 400);
    if (!senderId) throw new AppError('Ingrese Destinatario', 400);
    const done = await prisma.payMessages.update({
      where: { id },
      data: { status: 'FINALIZADO', paymentPdfData },
    });
    const quantityOrder = await prisma.companies.update({
      where: { id: companyId },
      data: { orderQuantity: ordenNumber + 1 },
      select: { orderQuantity: true },
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
    return { ...done, quantityOrder };
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
