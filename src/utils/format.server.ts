import {
  Company,
  Consortium,
  Contratc,
  PersonBussiness,
  Profiles,
  Projects,
  TypeSpecialities,
  UserRole,
  Users,
} from '@prisma/client';

export type userProfilePick = Pick<
  Users & Profiles,
  | 'email'
  | 'password'
  | 'firstName'
  | 'dni'
  | 'phone'
  | 'lastName'
  | 'job'
  | 'degree'
  | 'description'
  | 'cv'
  | 'declaration'
  | 'department'
  | 'province'
  | 'district'
  | 'ruc'
  | 'address'
  | 'addressRef'
  | 'firstNameRef'
  | 'lastNameRef'
  | 'phoneRef'
  | 'room'
  | 'userPc'
  | 'role'
>;

export type projectPick = Pick<
  Projects,
  'name'
  // | 'description'
  // | 'startDate'
  // | 'untilDate'
  // | 'unique'
  // | 'CUI'
  // | 'percentage'
> & {
  userId: Users['id'];
  typeSpecialityId: TypeSpecialities['id'];
  contractId: Contratc['id'];
  // specialistsInfo: PersonBussinessType[];
  // companyInfo: CompanyType;
  // consortiumInfo: ConsortiumType;
  stageName?: string;
};

export type UpdateProjectPick = Omit<
  projectPick,
  'typeSpecialityId' | 'unique' | 'stageName'
> & {
  // status: Projects['status'];
  contractId: Contratc['id'];
};

export type PersonBussinessType = Omit<PersonBussiness, 'id' | 'projectsId'>;
export type CompanyType = Omit<Company, 'id' | 'projectsId' | 'consortiumId'>;
export type ConsortiumPick = Omit<Consortium, 'id' | 'projectId'>;
export interface ConsortiumType extends ConsortiumPick {
  companies: CompanyType;
}
export interface userHash {
  password: string;
  id: number;
  role: UserRole;
  profile: Pick<Profiles, 'firstName' | 'lastName' | 'dni' | 'phone'> | null;
}
