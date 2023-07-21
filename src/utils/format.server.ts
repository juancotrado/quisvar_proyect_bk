import {
  PersonBussiness,
  Profiles,
  Projects,
  Specialities,
  Stages,
  UserRole,
  Users,
} from '@prisma/client';
import { ellipseAnnotation } from 'pdfkit';

export type userProfilePick = Pick<
  Users & Profiles,
  'email' | 'password' | 'firstName' | 'dni' | 'phone' | 'lastName'
>;

export type projectPick = Pick<
  Projects,
  | 'name'
  | 'description'
  | 'startDate'
  | 'untilDate'
  | 'typeSpeciality'
  | 'stageId'
  | 'unique'
  | 'CUI'
  | 'department'
  | 'province'
  | 'district'
> & {
  userId: Users['id'];
  specialityId: Specialities['id'];
  stageId: Stages['id'];
  listSpecialists: PersonBussinessType[];
};

export type UpdateProjectPick = Omit<projectPick, 'unique'> & {
  status: Projects['status'];
};

export type PersonBussinessType = Omit<PersonBussiness, 'id' | 'projectsId'>;
export interface userHash {
  password: string;
  id: number;
  role: UserRole;
  profile: Pick<Profiles, 'firstName' | 'lastName' | 'dni' | 'phone'> | null;
}
