import {
  Files,
  FilesMessage,
  IndexTasks,
  Levels,
  Mail,
  MessageHistory,
  Messages,
  SubTasks,
  Supervisor,
  Task_lvl_2,
  Task_lvl_3,
  Tasks,
  Users,
  WorkAreas,
} from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { type } from 'os';

export type CheckRoleType = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;
export type TypeFileUser = 'contract' | 'cv' | 'declaration';

export type PickSubtask = Pick<
  SubTasks,
  'id' | 'name' | 'item' | 'description' | 'price' | 'status'
> & { users: User[] };

export type StageParse = {
  name: string;
  id: number;
} | null;

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

export type TypeTables =
  | 'indexTasks'
  | 'workAreas'
  | 'tasks'
  | 'task_lvl_2'
  | 'task_lvl_3'
  | 'task_lvl_4'
  | 'task_lvl_5'
  | 'task_lvl_6'
  | 'task_lvl_7'
  | 'task_lvl_8'
  | 'task_lvl_9'
  | 'task_lvl_10';

export type ProjectDir = 'MODEL' | 'REVIEW' | 'UPLOADS' | 'EDITABLES';
export interface Level {
  id: number;
  item: string;
  name: string;
  rootId: number;
  spending: number;
  balance: number;
  percentage: number;
  total: number;
  isProject: boolean;
  isInclude: boolean;
  isArea: boolean;
  price: number;
  level: number;
  rootLevel: number;
  stagesId: number;
  userId: null;
  days: number;
  // details: Details;
  nextLevel?: Level[];
}

export interface Details {
  UNRESOLVED: number;
  PROCESS: number;
  INREVIEW: number;
  DENIED: number;
  LIQUIDATION: number;
  DONE: number;
  TOTAL: number;
}

export type SupervisorPick = Pick<Supervisor, 'type'> & { userId: Users['id'] };
export type updateReports = Pick<Reports, 'status' | 'stage'> & {
  supervisorId: Supervisor['id'];
  comments: string;
};

export type ReportByUserPick = {
  userId: Users['id'];
  name: string;
  supervisorId: number;
};

export interface DuplicateLevel {
  name: string;
  id: number;
  stagesId: number;
  type: 'ROOT' | 'ID';
}

export interface GetFilterLevels extends Levels {
  subTasks?: SubTaskFilter[];
}
export interface GetDuplicateLevels extends Levels {
  subTasks?: SubTaskFiles[];
  next?: GetDuplicateLevels[];
}
export interface SubTaskFilter extends SubTasks {
  users: {
    percentage: number;
  }[];
}
export interface SubTaskFiles extends SubTasks {
  files: Files[];
}

export interface ParametersMail {
  skip?: number;
  limit?: number;
  type?: Mail['type'];
  // status?: boolean;
  typeMessage?: Messages['type'];
  status?: Messages['status'];
  assignedAt?: 'asc' | 'desc';
}
export interface PickMail extends Messages {
  senderId: Users['id'];
  receiverId: Users['id'];
  idMessageReply?: number;
  idMessageResend?: number;
  secondaryReceiver: { userId: number }[];
}
export interface PickMessageReply extends MessageHistory {
  // type?: Mail['type'];
  senderId: Users['id'];
  receiverId: Users['id'];
  status?: Messages['status'];
  messageId: Messages['id'];
}
export type FileMessagePick = Pick<FilesMessage, 'name' | 'path' | 'attempt'>;
export type UpdateLevelBlock = Levels & {
  subTasks: {
    id: number;
    item: string;
    index: number;
    files: { id: number; dir: string; name: string; type: Files['type'] }[];
  }[];
};
