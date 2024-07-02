import { PayMailServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';
import AppError from '../utils/appError';
import {
  ParametersPayMail,
  PickPayMail,
  PickPayMessageReply,
  PickSealPayMessage,
} from 'types/types';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { PayMessages } from '@prisma/client';
import { ControllerFunction } from 'types/patterns';
import { Request } from 'express';
import { isQueryNumber } from '../utils/tools';
import { parseQueries } from '../utils/format.server';

class PayMailControllers {
  public showMessages: ControllerFunction = async (req, res, next) => {
    try {
      const userInfo: UserType = res.locals.userInfo;
      const params = parseQueries<ParametersPayMail>(req.query);
      const query = await PayMailServices.getByUser(userInfo, params);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };

  public showHoldingMessages: ControllerFunction = async (req, res, next) => {
    try {
      const params = parseQueries<ParametersPayMail>(req.query);
      const query = await PayMailServices.onHolding(params);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };

  public showMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: messageId } = req.params;
      const { officeId: office } = req.query;
      const officeId = isQueryNumber(office as string);
      const userInfo: UserType = res.locals.userInfo;
      const query = await PayMailServices.getMessage(
        +messageId,
        userInfo,
        officeId
      );
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };

  private requestFiles(Request: Request, path: string, att?: boolean) {
    const attempt = att ? `${new Date().getTime()}` : undefined;
    if (!Request.files)
      throw new AppError('Oops!, no se pudo subir los archivos', 400);
    const { mainProcedure: main_file, fileMail: files } =
      Request.files as Record<string, Express.Multer.File[]>;
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
    const mainFiles =
      main_file?.map(({ filename: name, ...file }) => {
        renameSync(file.path, path + '/' + 'mp_' + name);
        return { name: 'mp_' + name, path, attempt };
      }) ?? [];
    const otherFiles = files?.map(({ filename: name, ...file }) => {
      renameSync(file.path, path + '/' + name);
      return { name, path, attempt };
    });
    return [...mainFiles, ...(otherFiles ?? [])];
  }

  public createReplyMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { status } = req.query as ParametersPayMail;
      const { body } = req;
      const { id: senderId }: UserType = res.locals.userInfo;
      const files = this.requestFiles(req, `public/mail/${senderId}`);
      const data = JSON.parse(body.data) as PickPayMessageReply;
      const query = await PayMailServices.createReply(
        { ...data, status, senderId },
        files
      );
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public declineHoldingStage: ControllerFunction = async (req, res, next) => {
    try {
      const ids: number[] = req.body.ids;
      console.log({ ids });
      const query = await PayMailServices.decline(ids);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public createSeal: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const { id: senderId }: UserType = res.locals.userInfo;
      const data = JSON.parse(body.data) as PickSealPayMessage;
      // const data = body as PickSealMessage;
      const files = this.requestFiles(req, `public/mail/${senderId}`);
      const result = await PayMailServices.updateDataWithSeal(
        data,
        files,
        senderId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public updateMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      const { id: messageId } = req.params;
      const files = this.requestFiles(req, `public/mail/${senderId}`, true);
      const { body } = req;
      const data = JSON.parse(body.data) as PickPayMail;
      const query = await PayMailServices.updateMessage(
        +messageId,
        { ...data, senderId },
        files
      );
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public updateHoldingStage: ControllerFunction = async (req, res, next) => {
    try {
      const ids: number[] = req.body.ids;
      const query = await PayMailServices.changeHoldingStatus(ids);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public createMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      //--------------------------------------------------------------------------
      const files = this.requestFiles(req, `public/mail/${senderId}`, true);
      //--------------------------------------------------------------------------
      const { body } = req;
      const data = JSON.parse(body.data) as PickPayMail;
      const query = await PayMailServices.create({ ...data, senderId }, files);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public archivedMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      const { id: messageId } = req.params;
      const query = await PayMailServices.archived(+messageId, senderId);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public archivedList: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const query = await PayMailServices.archivedList(body);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public doneMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      const { paymentPdfData, companyId, ordenNumber } = req.body;
      const { id: messageId } = req.params;
      const query = await PayMailServices.done(+messageId, senderId, {
        paymentPdfData,
        companyId,
        ordenNumber,
      });
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public quantityFiles: ControllerFunction = async (req, res, next) => {
    try {
      const { id }: UserType = res.locals.userInfo;
      const query = await PayMailServices.quantityFiles(id);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };

  public createVoucher: ControllerFunction = async (req, res, next) => {
    try {
      const { id: messageId } = req.params;
      const { id: senderId }: UserType = res.locals.userInfo;
      //--------------------------------------------------------------------------
      const files = this.requestFiles(req, `public/voucher/${senderId}`);
      //--------------------------------------------------------------------------
      await PayMailServices.createVoucher(+messageId, { senderId }, files);
      res.status(200).json(files);
    } catch (error) {
      next(error);
    }
  };

  public declineVoucher: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      const { id: messageId } = req.params;
      const status = req.query.status as PayMessages['status'];
      const query = await PayMailServices.updateVoucher(+messageId, {
        senderId,
        status,
      });
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
}

export default new PayMailControllers();

// secondaryReceiver: [{ userId: 1 }],
