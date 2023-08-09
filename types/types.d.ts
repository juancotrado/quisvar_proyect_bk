import {
  IndexTasks,
  SubTasks,
  Task_lvl_2,
  Task_lvl_3,
  Tasks,
  WorkAreas,
} from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

export type CheckRoleType = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export type PickSubtask = Pick<
  SubTasks,
  'id' | 'name' | 'item' | 'description' | 'price' | 'status'
> & { users: User[] };

export type User = {
  percentage: number;
  user: {
    id: number;
    profile: {
      firstName: string;
      lastName: string;
      dni: string;
      phone: string | null;
    } | null;
  };
};

export type PriceAreaTask = Pick<WorkAreas, 'id' | 'name' | 'item'> & {
  indexTasks: PriceIndexTask[];
};
export type PriceIndexTask = Pick<IndexTasks, 'id' | 'name' | 'item'> & {
  subTasks: PickSubtask[];
  tasks: PriceTask[];
};
export type PriceTask = Pick<Tasks, 'id' | 'name' | 'item'> & {
  subTasks: PickSubtask[];
  tasks_2: PriceTaskLvl2[];
};
export type PriceTaskLvl2 = Pick<Task_lvl_2, 'id' | 'name' | 'item'> & {
  subTasks: PickSubtask[];
  tasks_3: PriceTaskLvl3[];
};
export type PriceTaskLvl3 = Pick<Task_lvl_3, 'id' | 'name' | 'item'> & {
  subTasks: PickSubtask[];
};
