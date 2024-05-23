import { Response } from 'express';
import { DowloadServices } from '../services';
import { archiverFolder } from '../utils/archiver';
import { access, constants, createReadStream, rmSync } from 'fs';
import { ControllerFunction } from 'types/patterns';
import AppError from '../utils/appError';
import path from 'path';
import { parseQueries } from '../utils/format.server';
import { OptionsBasicFilters } from 'types/types';

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
  private typeOperation: 'stage' | 'level' = 'level';

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
      this.typeOperation = type;
    }
  }

  public basicLevel: ControllerFunction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = parseQueries<OptionsBasicFilters>(req.query);
      const sourceDir = 'download/' + id;
      const outputFilePath = 'download/basic_project.zip';
      const attributes = {
        sourceDir,
        createFiles: false,
        ...query,
      };
      await DowloadServices.basicLevel(+id, this.typeOperation, attributes);
      // includeFiles: true,equal: false,endsWith: '.pdf',createFiles: false,
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
}

export default DownloadController;
