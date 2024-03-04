import { BasicLevels } from '@prisma/client';
import { numberToConvert } from '../utils/tools';
import { DuplicateLevel } from 'types/types';
import { prisma } from '../utils/prisma.server';
import AppError from '../utils/appError';

class BasicLevelServices {
  static async duplicate(
    id: number,
    stageId: number,
    name: string,
    type: DuplicateLevel['type']
  ) {
    let rootId, stagesId;
    rootId = id;
    stagesId = stageId;
    if (name.includes('_basic'))
      throw new AppError('Error palabra reservada', 404);
    if (type === 'ID') {
      const getLevel = await prisma.basicLevels.findUnique({ where: { id } });
      if (!getLevel) throw new AppError('No se pudo encontrar el índice', 404);
      rootId = getLevel.rootId;
      stagesId = getLevel.stagesId;
    }
    const list = await prisma.basicLevels.groupBy({
      by: ['id', 'name'],
      _count: true,
      where: { rootId, stagesId },
    });
    const duplicate = list.some(l => l.name.includes(name));
    console.log(duplicate);
  }

  static async create({
    name,
    stagesId,
    rootId,
    userId,
    typeItem,
  }: BasicLevels) {
    //------------------------ Set new item ---------------------------
    const quantity = 0;
    const index = quantity + 1;
    const _type = numberToConvert(index, typeItem);
    const getDuplicate = await this.duplicate(rootId, stagesId, name, 'ROOT');
    console.log(_type);
    const data = { name, typeItem, stagesId, rootId };
    // const newLevel = await prisma.basicLevels.create({ data });
    return { getDuplicate };
  }

  static async delete(id: BasicLevels['id']) {
    console.log(id);
  }
}

export default BasicLevelServices;
