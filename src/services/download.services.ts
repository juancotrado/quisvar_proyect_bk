import { existsSync, mkdirSync } from 'fs';
import AppError from '../utils/appError';
import BasicLevelServices from './basiclevels.services';
import { BasicLevelAttributes, MergePdfLevelAttributes } from 'types/types';

class DowloadServices {
  public static async basicLevel(
    id: number,
    type: 'level' | 'stage',
    {
      sourceDir: path,
      itemLevel: item = '',
      createFiles = true,
      ...options
    }: BasicLevelAttributes
  ) {
    if (!id) throw new AppError('Oops!, ID incorrecto', 500);
    const getList = await BasicLevelServices.getList(id, type, options);
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
    const attributes = { item, path, ...getList.info };
    const listWithPaths = await BasicLevelServices.folderlist(
      getList.data,
      attributes,
      createFiles
    );
    if (!listWithPaths.length)
      throw new AppError('Error, no se encontraron archivos', 404);
    return listWithPaths;
  }

  public static async mergePdfLevel(
    id: number,
    type: 'level' | 'stage',
    { createCover, createFiles, ...options }: MergePdfLevelAttributes
  ) {
    if (!id) throw new AppError('Oops!, ID incorrecto', 500);
    const { sourceDir, itemLevel: item = '' } = options;
    const splitOptions = { endsWith: '.pdf', equal: true, includeFiles: true };
    const getList = await BasicLevelServices.getList(id, type, {
      ...options,
      ...splitOptions,
    });
    if (!existsSync(sourceDir)) mkdirSync(sourceDir, { recursive: true });
    const attributes = { item, path: sourceDir, ...getList.info };
    const listWithPaths = await BasicLevelServices.mergePDFList(
      getList.data,
      sourceDir,
      attributes,
      { createFiles, createCover }
    );
    if (!listWithPaths.length)
      throw new AppError('Error, no se encontraron archivos', 404);
    return { listWithPaths, sourceDir };
  }
}
export default DowloadServices;
