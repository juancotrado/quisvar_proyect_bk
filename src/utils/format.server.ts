import { Profiles, UserRole, Users } from '@prisma/client';

export type userProfilePick = Pick<
  Users & Profiles,
  'email' | 'password' | 'firstName' | 'dni' | 'phone' | 'lastName'
>;

export interface userHash {
  password: string;
  id: number;
  role: UserRole;
  profile: Pick<Profiles, 'firstName' | 'lastName' | 'dni' | 'phone'> | null;
}
