import { existsSync, mkdirSync } from 'fs';
import AppError from '../utils/appError';
import BasicLevelServices from './basiclevels.services';
import { OptionsBasicFilters } from 'types/types';

interface BasicLevelAttributes extends OptionsBasicFilters {
  sourceDir: string;
  itemLevel?: string;
  createFiles?: boolean;
}

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
    return listWithPaths;
  }
}
export default DowloadServices;
