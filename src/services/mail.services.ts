import { Mail, Messages, Users } from '@prisma/client';
import { prisma } from '../utils/prisma.server';
import {
  FileMessagePick,
  ParametersMail,
  PickMail,
  PickMessageReply,
  PickSealMessage,
  ReceiverT,
  ReceiverTypeMailPick,
} from 'types/types';
import Queries from '../utils/queries';
import AppError from '../utils/appError';
import { UserType } from '../middlewares/auth.middleware';
import lodash from 'lodash';
import GenerateFiles from '../utils/generateFile';

type UpdateMessage = Pick<
  PickMessageReply,
  'senderId' | 'receiverId' | 'header' | 'description' | 'title'
>;
class MailServices {
  public static async onHolding({
    offset: skip,
    limit: take,
    officeId,
    typeMessage,
    onHolding,
    status,
  }: ParametersMail) {
    const total = await prisma.messages.count({
      where: {
        officeId,
        status,
        type: typeMessage,
        onHolding,
        category: 'DIRECT',
      },
    });
    const mailList = await prisma.messages.findMany({
      where: {
        officeId,
        status,
        type: typeMessage,
        onHolding,
        category: 'DIRECT',
      },
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
    const mailListUpdate = await prisma.messages.updateMany({
      where: { id: { in: ids } },
      data: { onHolding: false, onHoldingDate: now },
    });
    return mailListUpdate;
  }

  public static async getByUser(
    { id: userId }: UserType,
    category: Messages['category'],
    {
      offset: skip,
      type,
      status,
      typeMessage,
      officeId,
      limit: take,
    }: ParametersMail
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
    const mail = await prisma.mail.findMany({
      where: {
        userId: newUser,
        type,
        message: {
          type: typeMessage,
          status,
          category,
          onHolding,
          historyOfficesIds,
        },
      },
      orderBy: { message: { updatedAt: 'desc' } },
      skip,
      take,
      select: {
        messageId: true,
        status: true,
        type: true,
        userInit: true,
        message: Queries.PayMail().selectMessage('MAIN'),
      },
    });
    const parseList = mail.map(({ message, ...data }) => {
      const userInit = message.users.find(user => user.userInit);
      const _message = { ...message, userInit };
      return { ...data, message: _message };
    });
    const total = await prisma.mail.count({
      where: {
        userId: newUser,
        type,
        message: {
          status: status ? status : { not: 'ARCHIVADO' },
          type: typeMessage,
          category,
          onHolding,
          historyOfficesIds,
        },
      },
    });
    return { total, mailList: parseList };
  }

  static async getMessageShort(id: Messages['id']) {
    if (!id) throw new AppError('Ops!, ID invalido', 400);
    const getMessage = await prisma.messages.findUnique({
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

  public static async getMessage(
    id: Messages['id'],
    dataUser: UserType,
    officeId?: number
  ) {
    if (!id) throw new AppError('Ops!, ID invalido', 400);
    if (officeId === 0) throw new AppError('Ops!, officina inválida', 400);
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
    const initialSender = users.find(({ userInit }) => userInit);
    return { ...getMessage, initialSender, users };
  }

  static async getMessagePreview(id: Messages['id']) {
    if (!id) throw new AppError('Ops!, ID invalido', 400);
    const getPayMessage = await prisma.messages.findUnique({
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

  public static async create(
    {
      title,
      description,
      type,
      header,
      officeId,
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
          onHolding: false,
          onHoldingDate: new Date(),
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
    const receiverList: ReceiverTypeMailPick[] = getUserOffice
      ? [{ userId: getUserOffice.users[0].usersId, role, status }]
      : [{ userId: receiverId, role, status }];
    const historyOfficesIds = getUserOffice ? [officeId] : [];

    const createMessage = await prisma.messages.create({
      data: {
        title,
        header,
        description,
        type,
        category,
        officeId,
        historyOfficesIds,
        users: {
          createMany: {
            data: [
              ...secondaryReceiver,
              // { userId: receiverId, role, status }
              ...receiverList,
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

  public static async createReply(
    id: number,
    {
      receiverId,
      senderId,
      officeId,
      status,
      // messageId: id,
      ...data
    }: Omit<
      PickMessageReply,
      'messageId' | 'paymessageId' | 'createdAt' | 'id' | 'userId'
    >,
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
    const getSender = await prisma.messages.findUnique({
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
      await prisma.messages.update({
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
      await prisma.mail.update({
        where: {
          userId_messageId: { messageId: id, userId: newReceiver },
        },
        data: { ...receiv },
      });
    } else {
      await prisma.mail.upsert({
        where: { userId_messageId: { messageId: id, userId: receiverId } },
        update: { ...receiv },
        create: { messageId: id, userId: receiverId, ...receiv },
      });
    }
    //------------------------------------------------------------------
    await prisma.mail.update({
      where: { userId_messageId: { messageId: id, userId: newSender } },
      data: { type: 'SENDER', status: false },
    });
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

  static async updateDataWithSeal(
    {
      title,
      officeId,
      messageId: id,
      numberPage,
      observations,
      to,
    }: // ...data
    PickSealMessage,
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
    const getSender = await prisma.messages.findUnique({
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
    if (getSender.office?.id === officeId)
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
    await prisma.mail.upsert({
      where: {
        userId_messageId: { messageId: id, userId: newReceiver },
      },
      update: { ...receiv },
      create: { messageId: id, userId: newReceiver, ...receiv },
    });
    await prisma.mail.update({
      where: { userId_messageId: { messageId: id, userId: newSender } },
      data: { type: 'SENDER', status: false },
    });
    //-------------------------------------------------------------------
    const { historyOfficesIds: listOfficeIds } = getSender;
    const existOffice = listOfficeIds.find(id => id === officeId);
    const historyOfficesIds = existOffice
      ? undefined
      : [...listOfficeIds, officeId];
    //---------------------------------------------------------------------------
    await prisma.messages.update({
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

  static async archivedList({ ids }: { ids: Messages['id'][] }) {
    const updateList = ids.map(id => {
      const archived = prisma.messages.update({
        where: { id },
        data: {
          status: 'ARCHIVADO',
          users: {
            updateMany: {
              where: { messageId: id },
              data: { type: 'RECEIVER', status: false },
            },
          },
        },
      });
      return archived;
    });
    return await prisma.$transaction(updateList);
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

  public static async quantityFiles(userId: Users['id']) {
    const quantity = await prisma.messages.groupBy({
      by: ['type'],
      _count: { type: true },
      where: {
        type: { not: 'MEMORANDUM_GLOBAL' },
        users: {
          some: { userId },
        },
      },
    });
    const global = await prisma.messages.groupBy({
      by: ['type'],
      _count: { type: true },
      where: { type: 'MEMORANDUM_GLOBAL' },
    });
    const total = [...quantity, ...global];
    return total;
  }
}
export default MailServices;
