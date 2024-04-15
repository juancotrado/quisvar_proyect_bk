import { PayMailServices } from '../services';
import { UserType } from '../middlewares/auth.middleware';
import AppError from '../utils/appError';
import {
  ParametersPayMail,
  PickPayMail,
  PickPayMessageReply,
  PickSealMessage,
} from 'types/types';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { PayMessages } from '@prisma/client';
import { ControllerFunction } from 'types/patterns';
import { Request } from 'express';

class PayMailControllers {
  public showMessages: ControllerFunction = async (req, res, next) => {
    try {
      const { skip: _skip, ...params } = req.query as ParametersPayMail;
      const userInfo: UserType = res.locals.userInfo;
      const userId = userInfo.id;
      const offset = parseInt(`${_skip}`);
      const skip = !isNaN(offset) ? offset : undefined;
      const newParams = { skip, ...params };
      const query = await PayMailServices.getByUser(userId, newParams);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };

  public showHoldingMessages: ControllerFunction = async (req, res, next) => {
    try {
      const { skip: _skip, ...params } = req.query as ParametersPayMail;
      const offset = parseInt(`${_skip}`);
      const skip = !isNaN(offset) ? offset : undefined;
      const onHolding = !req.query.onHolding || req.query.onHolding === 'true';
      const newParams = { skip, ...params, onHolding };
      const query = await PayMailServices.onHolding(newParams);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };

  public showMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const messageId = parseInt(id);
      const query = await PayMailServices.getMessage(messageId);
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
      const userInfo: UserType = res.locals.userInfo;
      const senderId = userInfo.id;
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

  public createSeal: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const { id: senderId }: UserType = res.locals.userInfo;
      const data = JSON.parse(body.data) as PickSealMessage;
      // const data = body as PickSealMessage;
      const files = this.requestFiles(req, `public/mail/${senderId}`);
      const result = await PayMailServices.updateDataWithSeal(data, files);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public updateMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      const { id } = req.params;
      const _messageId = parseInt(id);
      const files = this.requestFiles(req, `public/mail/${senderId}`, true);
      const { body } = req;
      const data = JSON.parse(body.data) as PickPayMail;
      const query = await PayMailServices.updateMessage(
        _messageId,
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

  public doneMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      const { paymentPdfData } = req.body;
      const { id: messageId } = req.params;
      const query = await PayMailServices.done(
        +messageId,
        senderId,
        paymentPdfData
      );
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
