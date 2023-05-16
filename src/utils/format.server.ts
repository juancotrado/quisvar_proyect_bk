import { Profiles, Projects, UserRole, Users } from '@prisma/client';

export type userProfilePick = Pick<
  Users & Profiles,
  'email' | 'password' | 'firstName' | 'dni' | 'phone' | 'lastName'
>;

export type projectPick = Pick<
  Projects,
  'name' | 'description' | 'untilDate' | 'price' | 'startDate'
>;

export interface userHash {
  password: string;
  id: number;
  role: UserRole;
  profile: Pick<Profiles, 'firstName' | 'lastName' | 'dni' | 'phone'> | null;
}
