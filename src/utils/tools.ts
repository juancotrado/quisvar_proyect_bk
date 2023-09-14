import { Levels, SubTasks, TaskRole } from '@prisma/client';
import {
  Details,
  DuplicateLevel,
  Level,
  PickSubtask,
  PriceAreaTask,
  PriceIndexTask,
  PriceTask,
  PriceTaskLvl2,
  PriceTaskLvl3,
  TypeTables,
} from 'types/types';
import { prisma } from './prisma.server';
import AppError from './appError';
import { PathLevelServices } from '../services';
import { existsSync } from 'fs';

export const sumValues = (list: any[], label: string) => {
  const sum = list.reduce((a: number, c) => a + +c[label], 0);
  if (Number.isNaN(sum)) return 0;
  return sum;
};

export const parseSubTasks = (
  listSubtask: PickSubtask[],
  _percentage: number
) => {
  return listSubtask.map(subtask => {
    const percentage = sumValues(subtask.users, 'percentage');
    const spending =
      subtask.status === 'LIQUIDATION'
        ? subtask.price
        : subtask.status === 'DONE'
        ? parseFloat(((+subtask.price * _percentage) / 100).toFixed(2))
        : 0;
    const balance = +subtask.price - +spending;
    return {
      percentage,
      spending,
      balance,
      ...subtask,
    };
  });
};

export const percentageSubTasks = (
  listSubtask: PickSubtask[],
  _percentage: number
) => {
  return listSubtask.map(subtask => {
    const percentage = sumValues(subtask.users, 'percentage');
    const spending =
      subtask.status === 'LIQUIDATION'
        ? subtask.price
        : subtask.status === 'DONE'
        ? parseFloat(((+subtask.price * _percentage) / 100).toFixed(2))
        : 0;
    const balance = +subtask.price - +spending;
    return {
      percentage,
      spending,
      balance,
      ...subtask,
    };
  });
};

export const priceTotalArea = (list: PriceAreaTask[], percentage: number) => {
  return list.map(area => {
    const indexTasks = priceTotalIndexTask(area.indexTasks, percentage);
    const price = sumValues(indexTasks, 'price');
    const spending = sumValues(indexTasks, 'spending');
    const balance = price - spending;
    const taskInfo = getQuantityDetail(indexTasks);
    return { price, spending, balance, taskInfo, ...area, indexTasks };
  });
};

export const priceTotalIndexTask = (
  list: PriceIndexTask[],
  percentage: number
) => {
  return list.map(indextask => {
    const subTasks = parseSubTasks(indextask.subTasks, percentage);
    const tasks = priceTotalTask(indextask.tasks, percentage);
    const price =
      sumValues(indextask.subTasks, 'price') + sumValues(tasks, 'price');
    const spending =
      sumValues(subTasks, 'spending') + sumValues(tasks, 'spending');
    const balance = price - spending;
    const taskInfo = getDetailsSubtask(subTasks, tasks);
    return {
      price,
      spending,
      balance,
      taskInfo,
      ...indextask,
      subTasks,
      tasks,
    };
  });
};

export const priceTotalTask = (list: PriceTask[], percentage: number) => {
  return list.map(task => {
    const subTasks = parseSubTasks(task.subTasks, percentage);
    const tasks_2 = priceTotalTaskLvl2(task.tasks_2, percentage);
    const price =
      sumValues(task.subTasks, 'price') + sumValues(tasks_2, 'price');
    const spending =
      sumValues(subTasks, 'spending') + sumValues(tasks_2, 'spending');
    const balance = price - spending;
    const taskInfo = getDetailsSubtask(subTasks, tasks_2);
    return { price, spending, balance, taskInfo, ...task, subTasks, tasks_2 };
  });
};

export const priceTotalTaskLvl2 = (
  list: PriceTaskLvl2[],
  percentage: number
) => {
  return list.map(task_lvl_2 => {
    const subTasks = parseSubTasks(task_lvl_2.subTasks, percentage);
    const tasks_3 = priceTotalTaskLvl3(task_lvl_2.tasks_3, percentage);
    const price =
      sumValues(task_lvl_2.subTasks, 'price') + sumValues(tasks_3, 'price');
    const spending =
      sumValues(subTasks, 'spending') + sumValues(tasks_3, 'spending');
    const balance = price - spending;
    const taskInfo = getDetailsSubtask(subTasks, tasks_3);
    return {
      price,
      spending,
      balance,
      taskInfo,
      ...task_lvl_2,
      subTasks,
      tasks_3,
    };
  });
};

export const priceTotalTaskLvl3 = (
  list: PriceTaskLvl3[],
  percentage: number
) => {
  return list.map(task_lvl_3 => {
    const price = sumValues(task_lvl_3.subTasks, 'price');
    const subTasks = parseSubTasks(task_lvl_3.subTasks, percentage);
    const spending = sumValues(subTasks, 'spending');
    const taskInfo = getDetailsSubtask(subTasks);
    const balance = price - spending;
    return {
      price,
      spending,
      balance,
      taskInfo,
      ...task_lvl_3,
      subTasks,
    };
  });
};

export const getDetailsSubtask = (listSubtask: PickSubtask[], list?: any[]) => {
  const UNRESOLVED = quantityTaskByStatus(listSubtask, 'UNRESOLVED', list);
  const PROCESS = quantityTaskByStatus(listSubtask, 'PROCESS', list);
  const INREVIEW = quantityTaskByStatus(listSubtask, 'INREVIEW', list);
  const DENIED = quantityTaskByStatus(listSubtask, 'DENIED', list);
  const DONE = quantityTaskByStatus(listSubtask, 'DONE', list);
  const LIQUIDATION = quantityTaskByStatus(listSubtask, 'LIQUIDATION', list);
  const listTaskLength = list?.map(t => t.subTasks).flat().length || 0;
  const TOTAL = listSubtask.length + listTaskLength;
  return { UNRESOLVED, PROCESS, INREVIEW, DENIED, DONE, LIQUIDATION, TOTAL };
};

export const getQuantityDetail = (list: any[]) => {
  const UNRESOLVED = quantityTaskByArea('UNRESOLVED', list);
  const PROCESS = quantityTaskByArea('PROCESS', list);
  const INREVIEW = quantityTaskByArea('INREVIEW', list);
  const DENIED = quantityTaskByArea('DENIED', list);
  const DONE = quantityTaskByArea('DONE', list);
  const LIQUIDATION = quantityTaskByArea('LIQUIDATION', list);
  const TOTAL = UNRESOLVED + PROCESS + INREVIEW + DENIED + DONE + LIQUIDATION;
  return { UNRESOLVED, PROCESS, INREVIEW, DENIED, DONE, LIQUIDATION, TOTAL };
};

export const countSubTask = (listSubtask: PickSubtask[], status: TaskRole) => {
  return listSubtask.filter(s => s.status === status).length;
};
const quantityTaskByStatus = (
  listSubtask: PickSubtask[],
  status: TaskRole,
  listTask: any[] | undefined
) => {
  const total_quantity: number =
    (listTask && listTask.reduce((a, c) => a + c.taskInfo[status], 0)) || 0;
  return countSubTask(listSubtask, status) + total_quantity;
};

const quantityTaskByArea = (status: TaskRole, listTask: any[] | undefined) => {
  const total_quantity: number =
    (listTask && listTask.reduce((a, c) => a + c.taskInfo[status], 0)) || 0;
  return total_quantity;
};

export const calculateAndUpdateDataByLevel = (levels: Level[]) => {
  levels.forEach(level => {
    level.balance = calculateSumTotal(level, 'balance', null);
    level.spending = calculateSumTotal(level, 'spending', null);
    level.price = calculateSumTotal(level, 'price', null);
    level.details.UNRESOLVED = calculateSumTotal(
      level,
      'details',
      'UNRESOLVED'
    );
    level.details.PROCESS = calculateSumTotal(level, 'details', 'PROCESS');
    level.details.INREVIEW = calculateSumTotal(level, 'details', 'INREVIEW');
    level.details.DENIED = calculateSumTotal(level, 'details', 'DENIED');
    level.details.LIQUIDATION = calculateSumTotal(
      level,
      'details',
      'LIQUIDATION'
    );
    level.details.DONE = calculateSumTotal(level, 'details', 'DONE');
    level.details.TOTAL = calculateSumTotal(level, 'details', 'TOTAL');
    if (level.nextLevel && level.nextLevel.length > 0) {
      calculateAndUpdateDataByLevel(level.nextLevel);
    }
  });
  return levels;
};

const calculateSumTotal = (
  level: Level,
  type: keyof Level,
  subType: keyof Details | null
) => {
  let sumaBalance = level[type] as number;
  if (subType && type === 'details') sumaBalance = level[type][subType];
  if (level.nextLevel && level.nextLevel.length > 0) {
    for (const subLevel of level.nextLevel) {
      sumaBalance += calculateSumTotal(subLevel, type, subType);
    }
  }
  return sumaBalance;
};

export const LEVEL_DATA: Level = {
  id: 0,
  item: '',
  name: '',
  rootId: 0,
  spending: 0,
  balance: 0,
  price: 0,
  level: 0,
  rootLevel: 0,
  stagesId: 0,
  isInclude: false,
  isArea: false,
  isProject: false,
  userId: null,
  details: {
    UNRESOLVED: 0,
    PROCESS: 0,
    INREVIEW: 0,
    DENIED: 0,
    DONE: 0,
    LIQUIDATION: 0,
    TOTAL: 0,
  },
};

export const getRootPath = async (id: number) => {
  if (!id) throw new AppError('Oops!, ID invalido', 400);
  const findLevel = await prisma.levels.findUnique({ where: { id } });
  if (!findLevel) throw new AppError('No se pudieron encontrar el nivel', 404);
  const { rootId, stagesId, item, ...level } = findLevel;
  const rootPath = await existRootLevelPath(rootId, stagesId);
  return { rootId, stagesId, rootPath, _item: item, ...level };
};

export const existRootLevelPath = async (rootId: number, stagesId: number) => {
  const rootPath = rootId
    ? await PathLevelServices.pathLevel(rootId)
    : await PathLevelServices.pathStage(stagesId, 'UPLOADS');
  if (!existsSync(rootPath)) throw new AppError('Ops!,carpeta no existe', 404);
  return rootPath;
};

export const getRootItem = (item: string) => {
  const values = item.split('.');
  const rootItem = values.slice(0, -1).join('.');
  const lastItem = values.at(-1) || '';
  return { rootItem, lastItem };
};

export const parseRootItem = (item: string, index: number) => {
  const { rootItem, lastItem } = getRootItem(item);
  const quantity = +lastItem + index;
  const newRootItem = rootItem ? rootItem + '.' : '';
  const newItem = newRootItem + quantity;
  return newItem;
};
export const filterLevelList = (
  rootList: Levels[],
  _rootId: number,
  _rootLevel: number
) => {
  const findList = rootList.filter(
    ({ rootId, rootLevel }) => rootId === _rootId && rootLevel === _rootLevel
  );
  const list = rootList.filter(value => !findList.includes(value));
  return { findList, list };
};
