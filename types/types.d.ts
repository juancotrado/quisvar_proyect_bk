import {
  Contratc,
  Files,
  FilesMessage,
  Levels,
  PayMail,
  MessageHistory,
  Messages,
  Stages,
  SubTasks,
  Supervisor,
  Users,
  PayMessages,
  Mail,
  BasicLevels,
  BasicTasks,
  BasicFiles,
  Office,
  SubMenuPoints,
  MenuPoints,
} from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

export type CheckRoleType = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;
export type TypeFileUser = keyof Pick<
  User,
  'contract' | 'cv' | 'declaration' | 'withdrawalDeclaration'
>;

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
  listUsers: usersCount[];
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
export interface GetFilterBasicLevels extends BasicLevels {
  subTasks?: BasicTasks[];
}
export interface GetFolderBasicLevels extends BasicLevels {
  subTasks?: BasicTaskFolder[];
}

export interface BasicTaskFolder extends BasicTasks {
  files?: BasicFiles[];
}

export interface FolderLevels {
  id: number;
  index: number;
}

export interface BasicFilesForm {
  dir: string;
  type: BasicFiles['type'];
  subTasksId: number;
  name: string;
  userId: number | null;
}

export type TypeIdsList = number | TypeIdsList[];
export interface GetDuplicateLevels extends Levels {
  subTasks?: SubTaskFiles[];
  next?: GetDuplicateLevels[];
}
export interface SubTaskFilter extends SubTasks {
  users: {
    percentage: number;
    userId: number;
    user: {
      id: number;
      profile: {
        firstName: string;
        lastName: string;
        dni: string;
        phone: string | null;
        degree: string | null;
        description: string | null;
      } | null;
    };
  }[];
}

export interface BasicTaskFilter extends BasicTasks {
  users: {
    percentage: number;
    userId: number;
    user: {
      id: number;
      profile: {
        firstName: string;
        lastName: string;
        dni: string;
        phone: string | null;
        degree: string | null;
        description: string | null;
      } | null;
    };
  }[];
}
export interface SubTaskFiles extends SubTasks {
  files: Files[];
}
export type FilesProps = { [fieldname: string]: Express.Multer.File[] };
export interface ParametersPayMail {
  skip?: number;
  limit?: number;
  type?: PayMail['type'];
  officeId?: PayMessages['officeId'];
  // status?: boolean;
  typeMessage?: PayMessages['type'];
  status?: PayMessages['status'];
  assignedAt?: 'asc' | 'desc';
}
export interface ParametersMail {
  skip?: number;
  limit?: number;
  type?: Mail['type'];
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
export interface PickPayMail extends PayMessages {
  senderId: Users['id'];
  receiverId: Users['id'];
  officeId: Office['id'];
  idMessageReply?: number;
  idMessageResend?: number;
  secondaryReceiver: { userId: number }[];
}

export interface ReceiverTypePick {
  userId: number;
  role: PayMail['role'];
  status: PayMail['status'];
}
export interface PickMessageReply extends MessageHistory {
  // type?: Mail['type'];
  senderId: Users['id'];
  receiverId: Users['id'];
  status?: Messages['status'];
  messageId: Messages['id'];
}
export interface PickPayMessageReply extends MessageHistory {
  // type?: Mail['type'];
  senderId: Users['id'];
  officeId?: PayMessages['officeId'];
  receiverId: Users['id'];
  status?: PayMessages['status'];
  paymessageId: PayMessages['id'];
}

export interface PickSealMessage {
  title: string;
  header: string;
  officeId: number;
  paymessageId: number;
  observations?: string;
  title: string;
  numberPage?: number;
  to: string;
}
export type FileMessagePick = Pick<FilesMessage, 'name' | 'path'> & {
  attempt?: string;
};

export interface VerifyTokenT {
  id: number;
}
export type UpdateLevelBlock = Levels & {
  subTasks: {
    id: number;
    item: string;
    typeItem: SubTasks['typeItem'];
    index: number;
    files: {
      id: number;
      dir: string | null;
      name: string;
      type: Files['type'];
    }[];
  }[];
};

export interface usersCount {
  userId: number;
  firstName?: string;
  lastName?: string;
  count: number;
  dni?: string;
  degree?: string;
  percentage: number;
}

export type ContractForm = Pick<
  Contratc,
  | 'projectName'
  | 'type'
  | 'name'
  | 'cui'
  | 'amount'
  | 'createdAt'
  | 'indexContract'
  | 'department'
  | 'province'
  | 'district'
  | 'difficulty'
  | 'projectShortName'
  | 'companyId'
  | 'consortiumId'
>;

export type TypeCost = 'bachelor' | 'professional' | 'intern' | 'graduate';
export interface ListCostType {
  cost?: number;
  bachelor: number;
  professional: number;
  intern: number;
  graduate: number;
}

export type StageUpdate = Pick<
  Stages,
  | 'bachelorCost'
  | 'professionalCost'
  | 'groupId'
  | 'graduateCost'
  | 'internCost'
>;
export type ObjectNumber = { [key: string]: number };
export type ObjectAny = {
  [key: string]: number | string;
};
export type DegreeTypes =
  | 'Titulado'
  | 'Magister'
  | 'Doctorado'
  | 'Egresado'
  | 'Bachiller'
  | 'Practicante';
export interface DegreeList {
  degree: TypeCost;
  values: { id: number; value: DegreeTypes }[];
}

export interface UpperAddSubtask {
  name: string;
  days: number;
  description?: string;
}

export type CategoryMailType = 'GLOBAL' | 'DIRECT';

export type ReceiverT = Pick<Mail, 'type' | 'role' | 'status'>;

export interface MergePDFBasicFiles {
  status?: BasicTasks['status'];
  typeFile?: 'all' | 'pdf' | 'no_pdf';
}

export interface FolderBasicLevelList {
  id: number;
  index: number;
  path: string;
  subtasks: {
    id: number;
    index: number;
    name: string;
    path: string;
    files: { id: number; oldPath: string; newPath: string }[];
  }[];
  next: FolderBasicLevelList[];
}

export interface configurationSealPDF {
  x: number;
  y: number;
  title?: string;
  numberPage: number;
  to: string;
  date: string;
  observation?: string;
}

export interface ProfileByRoleType {
  subMenuId?: number;
  typeRol?: MenuPoints['typeRol'];
  subTypeRol?: SubMenuPoints['typeRol'];
  menuId?: number;
  includeSelf: boolean;
}
