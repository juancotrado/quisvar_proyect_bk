import {
  Profiles,
  Projects,
  Specialities,
  Stages,
  UserRole,
  Users,
} from '@prisma/client';

export type userProfilePick = Pick<
  Users & Profiles,
  'email' | 'password' | 'firstName' | 'dni' | 'phone' | 'lastName'
>;

export type projectPick = Pick<
  Projects,
  | 'name'
  | 'description'
  | 'untilDate'
  | 'startDate'
  | 'typeSpeciality'
  | 'unique'
  | 'CUI'
  | 'stageId'
  | 'location'
  | 'company'
  | 'department'
  | 'province'
  | 'district'
> & { userId: Users['id'] } & {
  specialityId: Specialities['id'];
} & { stageId: Stages['id'] } & {
  specialists: { career: string; name: string; phone: string; zip: number }[];
};

export interface userHash {
  password: string;
  id: number;
  role: UserRole;
  profile: Pick<Profiles, 'firstName' | 'lastName' | 'dni' | 'phone'> | null;
}
