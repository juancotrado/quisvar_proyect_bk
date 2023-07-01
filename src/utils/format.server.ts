import {
  Profiles,
  Projects,
  Specialities,
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
> & { userId: Users['id'] } & {
  specialityId: Specialities['id'];
};

export interface userHash {
  password: string;
  id: number;
  role: UserRole;
  profile: Pick<Profiles, 'firstName' | 'lastName' | 'dni' | 'phone'> | null;
}
