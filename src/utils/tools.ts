import { Levels, SubTasks, TaskRole, TypeItem } from '@prisma/client';
import {
  Details,
  DuplicateLevel,
  GetFilterLevels,
  Level,
  PickSubtask,
  PriceAreaTask,
  PriceIndexTask,
  PriceTask,
  PriceTaskLvl2,
  PriceTaskLvl3,
  ProjectDir,
  SubTaskFilter,
  UpdateLevelBlock,
  usersCount,
} from 'types/types';
import { prisma } from './prisma.server';
import AppError from './appError';
import { PathServices } from '../services';
import { existsSync } from 'fs';
import bcrypt from 'bcryptjs';

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
  listSubtask: SubTaskFilter[],
  _percentage: number
) => {
  return listSubtask.map(({ users, ...subtask }) => {
    const percentage = sumValues(users, 'percentage');
    const list = users.map(({ userId }) => userId);
    const listUsers: usersCount[] = list.reduce(
      (acc: typeof listUsers, userId) => {
        const existingItem = acc.find(item => item.userId === userId);
        if (existingItem) {
          existingItem.count++;
        } else {
          const findUser = users.find(u => u.userId === userId);
          const firstName = findUser?.user.profile?.firstName;
          const lastName = findUser?.user.profile?.lastName;
          const dni = findUser?.user.profile?.dni;
          acc.push({ userId, count: 1, firstName, lastName, dni });
        }
        return acc;
      },
      []
    );
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
      listUsers,
      users,
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
    level.balance = calculateSumTotal(level, 'balance');
    level.spending = calculateSumTotal(level, 'spending');
    level.price = calculateSumTotal(level, 'price');
    level.days = calculateSumTotal(level, 'days');
    level.total = calculateSumTotal(level, 'total');
    level.listUsers = calculateQuantityUser(level, 'listUsers');
    //---------------------------------------------------------------------
    // const listUsers = list.reduce((acc: typeof list, { count, userId }) => {
    //   const exist = acc.findIndex(u => u.userId === userId);
    //   exist > 0
    //     ? (acc[exist].count += count)
    //     : acc.push({ userId: userId, count: count });
    //   return acc;
    // }, []);
    //---------------------------------------------------------------------
    // level.percentage = calculateSumTotal(level, 'percentage');
    // level.details.UNRESOLVED = calculateSumTotal(
    //   level,
    //   'details',
    //   'UNRESOLVED'
    // );
    // level.details.PROCESS = calculateSumTotal(level, 'details', 'PROCESS');
    // level.details.INREVIEW = calculateSumTotal(level, 'details', 'INREVIEW');
    // level.details.DENIED = calculateSumTotal(level, 'details', 'DENIED');
    // level.details.LIQUIDATION = calculateSumTotal(
    //   level,
    //   'details',
    //   'LIQUIDATION'
    // );
    // level.details.DONE = calculateSumTotal(level, 'details', 'DONE');
    // level.details.TOTAL = calculateSumTotal(level, 'details', 'TOTAL');
    if (level.nextLevel && level.nextLevel.length > 0) {
      const _percentage =
        calculateSumTotal(level, 'percentage') / level.nextLevel.length;
      level.percentage = Math.round(_percentage * 100) / 100;
      calculateAndUpdateDataByLevel(level.nextLevel);
    }
  });
  return levels;
};

const calculateSumTotal = (
  level: Level,
  type: keyof Level
  // subType: keyof Details | null
) => {
  let sumaBalance = level[type] as number;
  // if (subType && type === 'details') sumaBalance = level[type][subType];
  if (level.nextLevel && level.nextLevel.length > 0) {
    for (const subLevel of level.nextLevel) {
      sumaBalance += calculateSumTotal(subLevel, type);
    }
  }
  return sumaBalance;
};
const calculateQuantityUser = (level: Level, type: keyof Level) => {
  let sumListUsers = level[type] as usersCount[];
  if (level.nextLevel && level.nextLevel.length > 0) {
    const list: typeof level.listUsers = level.nextLevel
      .map(l => calculateQuantityUser(l, type))
      .flat(2);
    const listUsers = list.reduce(
      (acc: typeof list, { count, userId, ...data }) => {
        const exist = acc.findIndex(u => u.userId === userId);
        exist > 0
          ? (acc[exist].count += count)
          : acc.push({ userId, count, ...data });
        return acc;
      },
      []
    );
    return listUsers;
  }
  return sumListUsers;
};

export const initialProfile = {
  firstName: '',
  lastName: '',
};

// export const LEVEL_DATA: Level = {
//   id: 0,
//   item: '',
//   name: '',
//   rootId: 0,
//   spending: 0,
//   balance: 0,
//   price: 0,
//   level: 0,
//   rootLevel: 0,
//   stagesId: 0,
//   isInclude: false,
//   isArea: false,
//   isProject: false,
//   userId: null,
//   // details: {
//   //   UNRESOLVED: 0,
//   //   PROCESS: 0,
//   //   INREVIEW: 0,
//   //   DENIED: 0,
//   //   DONE: 0,
//   //   LIQUIDATION: 0,
//   //   TOTAL: 0,
//   // },
// };

export const getRootPath = async (id: number) => {
  if (!id) throw new AppError('Oops!, ID invalido', 400);
  const findLevel = await prisma.levels.findUnique({ where: { id } });
  if (!findLevel) throw new AppError('No se pudieron encontrar el nivel', 404);
  const { item, ...level } = findLevel;
  const rootPath = await existRootLevelPath(
    findLevel.rootId,
    findLevel.stagesId
  );
  return { rootPath, _item: item, ...level };
};

export const existRootLevelPath = async (rootId: number, stagesId: number) => {
  const rootPath = rootId
    ? await PathServices.level(rootId)
    : await PathServices.stage(stagesId, 'UPLOADS');
  if (!existsSync(rootPath)) throw new AppError('Ops!,carpeta no existe', 404);
  return rootPath;
};

export const getRootItem = (item: string) => {
  const values = item.split('.').filter(v => v.length);
  const rootItem = values.slice(0, -1).join('.');
  const lastItem = values.at(-1) || '';
  return { rootItem, lastItem };
};

export const parseRootItem = (item: string, i: number) => {
  const { rootItem, lastItem } = getRootItem(item);
  const index = +lastItem + i;
  const newRootItem = rootItem ? rootItem + '.' : '';
  const newItem = newRootItem + index + '.';
  return newItem;
};
export const filterLevelList = (
  rootList: UpdateLevelBlock[],
  _rootId: number,
  _rootLevel: number
) => {
  const findList = rootList.filter(
    ({ rootId, rootLevel }) => rootId === _rootId && rootLevel === _rootLevel
  );
  const list = rootList.filter(value => !findList.includes(value));
  return { findList, list };
};

export const getFilterListLevels = (
  rootList: GetFilterLevels[],
  _rootId: number,
  _rootLevel: number
) => {
  const findList = rootList.filter(
    ({ rootId, rootLevel }) => rootId === _rootId && rootLevel === _rootLevel
  );
  const list = rootList.filter(value => !findList.includes(value));
  return { findList, list };
};

export const sumSubtaksByStage = (
  list: (Levels & {
    subTasks: SubTasks[];
  })[]
) => {
  const totalvalues = list.map(level => {
    const UNRESOLVED = level.subTasks.filter(
      ({ status }) => status === 'UNRESOLVED'
    ).length;
    const PROCESS = level.subTasks.filter(
      ({ status }) => status === 'PROCESS'
    ).length;
    const INREVIEW = level.subTasks.filter(
      ({ status }) => status === 'INREVIEW'
    ).length;
    const DENIED = level.subTasks.filter(
      ({ status }) => status === 'DENIED'
    ).length;
    const DONE = level.subTasks.filter(
      ({ status }) => status === 'DONE'
    ).length;
    const LIQUIDATION = level.subTasks.filter(
      ({ status }) => status === 'LIQUIDATION'
    ).length;
    return { UNRESOLVED, PROCESS, INREVIEW, DENIED, DONE, LIQUIDATION };
  });
  const UNRESOLVED = sumValues(totalvalues, 'UNRESOLVED');
  const PROCESS = sumValues(totalvalues, 'PROCESS');
  const INREVIEW = sumValues(totalvalues, 'INREVIEW');
  const DENIED = sumValues(totalvalues, 'DENIED');
  const DONE = sumValues(totalvalues, 'DONE');
  const LIQUIDATION = sumValues(totalvalues, 'LIQUIDATION');
  return { UNRESOLVED, PROCESS, INREVIEW, DENIED, DONE, LIQUIDATION };
};

export const sumPriceByStage = (
  list: (Levels & {
    subTasks: SubTasks[];
  })[]
) => {
  const totalvalues = list.map(level => {
    const price = sumValues(level.subTasks, 'price');
    const days = sumValues(level.subTasks, 'days');
    const spending = sumValues(level.subTasks, 'spending');
    const balance = price - spending;
    return { price, spending, balance, days };
  });
  const price = sumValues(totalvalues, 'price');
  const days = sumValues(totalvalues, 'days');
  const spending = sumValues(totalvalues, 'spending');
  const balance = price - spending;
  const details = sumSubtaksByStage(list);
  return { days, price, spending, balance, details };
};

export const convertToRoman = (number: number) => {
  let numberRoman = '';
  const dataRoman = [
    { value: 1000, roman: 'M' },
    { value: 900, roman: 'CM' },
    { value: 500, roman: 'D' },
    { value: 400, roman: 'CD' },
    { value: 100, roman: 'C' },
    { value: 90, roman: 'XC' },
    { value: 50, roman: 'L' },
    { value: 40, roman: 'XL' },
    { value: 10, roman: 'X' },
    { value: 9, roman: 'IX' },
    { value: 5, roman: 'V' },
    { value: 4, roman: 'IV' },
    { value: 1, roman: 'I' },
  ];
  for (const { roman, value } of dataRoman) {
    while (number >= value) {
      numberRoman += roman;
      number -= value;
    }
  }
  return numberRoman;
};

export const convertToLetter = (number: number) => {
  const _number = number + 64;
  if (_number < 65 || _number > 90) return false;
  return String.fromCharCode(_number);
};
const romanValues = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};
export const numberToConvert = (value: number, type: Levels['typeItem']) => {
  if (type === 'ABC') return convertToLetter(value);
  if (type === 'ROM') return convertToRoman(value);
  return value.toString();
};
export const convertToNumber = (value: string, type: Levels['typeItem']) => {
  if (type === 'ABC') return value.charCodeAt(0);
  if (type === 'ROM') {
    const listRoman = value.split('');
    const getNumber = listRoman.reduce(
      (acc, letter, i, arr) =>
        romanValues[letter as keyof typeof romanValues] <
        romanValues[arr[i + 1] as keyof typeof romanValues]
          ? acc - romanValues[letter as keyof typeof romanValues]
          : acc + romanValues[letter as keyof typeof romanValues],
      0
    );
    return getNumber;
  }
  return parseInt(value);
};

export const toEditablesFiles = (value: string, type?: 'MODEL' | 'REVIEW') => {
  // const getValue = value.split('/');
  // const index = getValue.findIndex(v => v === 'projects');
  // const rootPath = getValue.slice(0, index).join('/');
  // const lastPath = getValue.slice(index + 1).join('/');
  // const result = rootPath + '/editables/' + lastPath;
  if (type === 'MODEL') return value.replace('projects', 'models');
  if (type === 'REVIEW') return value.replace('projects', 'reviews');
  const result = value.replace('projects', 'editables');
  return result;
};
export const getPathStage = async (id: number, type: ProjectDir) => {
  return await PathServices.stage(id, type);
};
export const getPathProject = async (id: number, type: ProjectDir) => {
  return await PathServices.project(id, type);
};
export const setAdmin = async () => {
  const findAdmin = await prisma.users.findFirst({
    where: { profile: { dni: '00000001' } },
  });
  if (!findAdmin) {
    const password = await bcrypt.hash('admin', 10);
    const createAdmin = await prisma.users.create({
      data: {
        email: 'admin@admin.com',
        password,
        role: 'SUPER_ADMIN',
        status: true,
        profile: {
          create: {
            dni: '00000001',
            firstName: 'admin',
            lastName: 'admin',
            phone: '+51 000000001',
          },
        },
      },
    });
    if (!createAdmin) return false;
    return true;
  }
  return true;
};
