import { UserType } from '../middlewares/auth.middleware';
import AppError from '../utils/appError';
import {
  CategoryMailType,
  ParametersMail,
  PickMail,
  PickMessageReply,
  PickSealMessage,
} from 'types/types';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { Request } from 'express';
import { ControllerFunction } from 'types/patterns';
import MailServices from '../services/mail.services';
import { isQueryNumber } from '../utils/tools';
import { parseQueries } from '../utils/format.server';

export class MailControllers {
  public showMessages: ControllerFunction = async (req, res, next) => {
    try {
      const params = parseQueries<ParametersMail>(req.query);
      const { category } = parseQueries<{ category: CategoryMailType }>(
        req.query
      );
      const userInfo: UserType = res.locals.userInfo;
      const query = await MailServices.getByUser(userInfo, category, params);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };

  public showHoldingMessages: ControllerFunction = async (req, res, next) => {
    try {
      const params = parseQueries<ParametersMail>(req.query);
      const query = await MailServices.onHolding(params);
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
      const query = await MailServices.getMessage(
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

  public createMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      //--------------------------------------------------------------------------
      const category = req.body.category as CategoryMailType;
      if (!['GLOBAL', 'DIRECT'].includes(category))
        throw new AppError('Ingresar Valores válidos en categoria', 400);
      //--------------------------------------------------------------------------
      const files = this.requestFiles(req, `public/mail/${senderId}`, true);
      //--------------------------------------------------------------------------
      const data = JSON.parse(req.body.data) as Omit<PickMail, 'id'>;
      //--------------------------------------------------------------------------
      const query = await MailServices.create(
        { ...data, senderId },
        category,
        files
      );
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public createReplyMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { status } = req.query as ParametersMail;
      const { id: messageId } = req.params;
      const { id: senderId }: UserType = res.locals.userInfo;
      const files = this.requestFiles(req, `public/mail/${senderId}`);
      const data = JSON.parse(req.body.data) as PickMessageReply;
      const query = await MailServices.createReply(
        +messageId,
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
      const files = this.requestFiles(req, `public/mail/${senderId}`);
      const result = await MailServices.updateDataWithSeal(
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
      const data = JSON.parse(req.body.data) as Omit<PickMail, 'id'>;
      const query = await MailServices.updateMessage(
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
      const query = await MailServices.changeHoldingStatus(ids);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public archivedMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      const { id: messageId } = req.params;
      const query = await MailServices.archived(+messageId, senderId);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public archivedList: ControllerFunction = async (req, res, next) => {
    try {
      const { body } = req;
      const query = await MailServices.archivedList(body);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public doneMessage: ControllerFunction = async (req, res, next) => {
    try {
      const { id: senderId }: UserType = res.locals.userInfo;
      const { id: messageId } = req.params;
      const query = await MailServices.done(+messageId, senderId);
      res.status(201).json(query);
    } catch (error) {
      next(error);
    }
  };

  public quantityFiles: ControllerFunction = async (req, res, next) => {
    try {
      const { id }: UserType = res.locals.userInfo;
      const query = await MailServices.quantityFiles(id);
      res.status(200).json(query);
    } catch (error) {
      next(error);
    }
  };
}

export default MailControllers;
