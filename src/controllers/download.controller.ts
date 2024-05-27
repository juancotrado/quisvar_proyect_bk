import { Response } from 'express';
import { DowloadServices, PathServices } from '../services';
import { archiverFolder } from '../utils/archiver';
import {
  access,
  constants,
  createReadStream,
  existsSync,
  readdirSync,
  rmSync,
  statSync,
} from 'fs';
import { ControllerFunction } from 'types/patterns';
import AppError from '../utils/appError';
import path from 'path';
import { _parseQueries, parseQueries } from '../utils/format.server';
import { OptionsBasicFilters, OptionsMergePdfs } from 'types/types';
import GenerateFiles from '../utils/generateFile';
import { v4 as uuidv4 } from 'uuid';

export enum ContentType {
  PlainText = 'text/plain',
  HTML = 'text/html',
  CSS = 'text/css',
  JavaScript = 'text/javascript',
  JSON = 'application/json',
  XML = 'application/xml',
  OctetStream = 'application/octet-stream',
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  GIF = 'image/gif',
  MPEG = 'audio/mpeg',
  MP4 = 'video/mp4',
  PDF = 'application/pdf',
}
class DownloadController {
  private type: 'stage' | 'level' = 'level';
  private outPutPath: string = 'download/';
  public downloadLinks: {
    [key: string]: { filePath: string; expiresAt: number };
  } = {};
  private headers(
    res: Response,
    { filename, type }: { filename: string; type: keyof typeof ContentType }
  ) {
    const list = {
      'Content-Disposition': `attachment; filename=${filename}`,
      'Content-Type': ContentType[type],
    };
    Object.keys(list).forEach(header => {
      res.setHeader(header, list[header as keyof typeof list]);
    });
  }

  constructor(type?: 'stage' | 'level') {
    if (type) {
      this.type = type;
    }
  }

  public firstRoute: ControllerFunction = async (req, res, next) => {
    try {
      const uniqueId = uuidv4();
      const { baseUrl } = req;
      this.downloadLinks[uniqueId] = {
        filePath: 'download/archivito.pdf',
        expiresAt: Date.now() + 1 * 60 * 1000, // Expira en 10 minutos
      };
      // res.json(baseUrl);
      res.redirect(baseUrl + '/redirect/' + uniqueId);
    } catch (error) {
      next(error);
    }
  };

  public redirect: ControllerFunction = async (req, res, next) => {
    try {
      const { uuid } = req.params;
      const downloadEntry = this.downloadLinks[uuid];
      if (!downloadEntry) throw new AppError('error, link invalido', 400);
      if (Date.now() > downloadEntry.expiresAt) {
        delete this.downloadLinks[uuid];
        throw new AppError('error, link expirado', 410);
      }
      const time = downloadEntry.expiresAt - Date.now();
      res.json({
        messsage: 'ruta nueva',
        uuid,
        expires: time / 1000,
      });
    } catch (error) {
      next(error);
    }
  };

  public basicLevel: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const uniqueId = uuidv4();
      const query = parseQueries<OptionsBasicFilters>(req.query);
      const sourceDir = this.outPutPath + uniqueId;
      const outputFilePath = sourceDir + '.zip';
      const attributes = {
        sourceDir,
        createFiles: false,
        ...query,
      };
      await DowloadServices.basicLevel(+id, this.type, attributes);
      await archiverFolder(sourceDir, outputFilePath, { removeDir: true });
      access(outputFilePath, constants.F_OK, err => {
        if (err) throw new AppError('Error Execute', 500);
        const filename = path.basename(outputFilePath);
        const fileStream = createReadStream(outputFilePath);
        this.headers(res, { filename, type: 'OctetStream' });
        fileStream.pipe(res);
        res.on('finish', () => {
          rmSync(outputFilePath);
        });
      });
    } catch (error) {
      next(error);
    }
  };

  public mergePdfLevel: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = parseQueries<OptionsBasicFilters & OptionsMergePdfs>(
        req.query
      );
      const uniqueId = uuidv4();
      const source = this.outPutPath + uniqueId;
      const outputFilePath = source + '_merge.pdf';
      const attributes = { sourceDir: source, ...query };
      const type = this.type;
      const merge = await DowloadServices.mergePdfLevel(+id, type, attributes);
      const { sourceDir } = merge;
      const paths = readdirSync(sourceDir).map(path => `${sourceDir}/${path}`);
      await GenerateFiles.merge(paths, outputFilePath);
      access(outputFilePath, constants.F_OK, err => {
        if (err) throw new Error();
        const filename = path.basename(outputFilePath);
        const fileStream = createReadStream(outputFilePath);
        this.headers(res, { filename, type: 'OctetStream' });
        fileStream.pipe(res);
        res.on('finish', () => {
          const size = statSync(outputFilePath).size / (1024 * 1024);
          console.log(size.toFixed(2), 'total Megabytes');
          rmSync(sourceDir, { recursive: true });
          rmSync(outputFilePath);
        });
      });
    } catch (error) {
      next(error);
    }
  };

  public mergePdfLevel2: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const _path = await PathServices.level(+id);
      if (!existsSync(_path)) {
        throw new AppError('No se encontró la ruta', 404);
      }
      const rootPath = path.resolve(__dirname, '../..').replaceAll('\\', '/');
      const parsePath = _path.slice(1);
      const finalPath = rootPath + parsePath;
      const routeService = 'http://127.0.0.1:5000/pdf/merge2';
      const service = routeService + '?input_folder=' + finalPath;
      res.redirect(service);
    } catch (error) {
      next(error);
    }
  };

  public mergePdfStage: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const _path = await PathServices.stage(+id, 'UPLOADS');
      if (!existsSync(_path)) {
        throw new AppError('No se encontró la ruta', 404);
      }
      const rootPath = path.resolve(__dirname, '../..').replaceAll('\\', '/');
      const parsePath = _path.slice(1);
      const finalPath = rootPath + parsePath;
      const routeService = 'http://127.0.0.1:5000/pdf/merge2';
      const service = routeService + '?input_folder=' + finalPath;
      //res.json(service);
      res.redirect(service);
    } catch (error) {
      next(error);
    }
  };

  public compressPdf: ControllerFunction = async (req, res, next) => {
    try {
      interface TypeCompress {
        type: 'pdf' | 'nopdf' | 'all';
      }
      const { id } = req.params;
      const { type } = parseQueries<TypeCompress>(req.query);
      const _path = await PathServices.level(+id);
      if (!existsSync(_path)) {
        throw new AppError('No se encontró la ruta', 404);
      }
      const rootPath = path.resolve(__dirname, '../..').replaceAll('\\', '/');
      const parsePath = _path.slice(1);
      const finalPath = rootPath + parsePath;
      const routeService = 'http://127.0.0.1:5000/descargar_carpeta';
      const service =
        routeService + '?type=' + type + '&input_folder=' + finalPath;
      res.redirect(service);
    } catch (error) {
      next(error);
    }
  };

  public compressPdfStage: ControllerFunction = async (req, res, next) => {
    try {
      interface TypeCompress {
        type: 'pdf' | 'nopdf' | 'all';
      }
      const { id } = req.params;
      const { type } = parseQueries<TypeCompress>(req.query);
      const _path = await PathServices.stage(+id, 'UPLOADS');
      if (!existsSync(_path)) {
        throw new AppError('No se encontró la ruta', 404);
      }
      const rootPath = path.resolve(__dirname, '../..').replaceAll('\\', '/');
      const parsePath = _path.slice(1);
      const finalPath = rootPath + parsePath;
      const routeService = 'http://127.0.0.1:5000/descargar_carpeta';
      const service =
        routeService + '?type=' + type + '&input_folder=' + finalPath;
      //res.json(service);
      res.redirect(service);
    } catch (error) {
      next(error);
    }
  };
}

export default DownloadController;
