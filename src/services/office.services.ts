import { ProfileByRoleType } from 'types/types';
import { Office, prisma, UserToOffice } from '../utils/prisma.server';
import Queries from '../utils/queries';
import professionServices from './profession.services';

class OfficeServices {
  public static async getAll(
    userId: number,
    { typeRol, menuId, subMenuId, subTypeRol, includeSelf }: ProfileByRoleType
  ) {
    const notIn = includeSelf ? [userId] : [];
    const getListOffice = await prisma.office.findMany({
      include: {
        users: {
          where: {
            user: {
              id: { notIn },
              status: true,
              role: {
                menuPoints: {
                  some: {
                    menuId,
                    typeRol,
                    subMenuPoints: subMenuId
                      ? { some: { menuId: subMenuId, typeRol: subTypeRol } }
                      : {},
                  },
                },
              },
            },
          },
          select: {
            user: Queries.selectProfileUser,
            isOfficeManager: true,
          },
        },
      },
    });
    const parseOffice = getListOffice.map(({ users, ...data }) => {
      const manager = users.find(user => user.isOfficeManager)?.user;
      const job = professionServices.find(manager?.profile?.job || '');
      const newManager = { ...manager, profile: { ...manager?.profile, job } };
      const parseUsers = users.map(({ user, ...value }) => {
        const job = professionServices.find(user.profile?.job || '');
        const _user = { ...user, profile: { ...user.profile, job } };
        const newUser = { ..._user, office: data.name };
        return { ...value, user: newUser };
      });
      return {
        ...data,
        _count: { users: parseUsers.length },
        manager: newManager,
        users: parseUsers,
      };
    });
    return parseOffice;
  }

  public static async create({ name }: Office) {
    const createOffice = await prisma.office.create({ data: { name } });
    return createOffice;
  }

  public static async update(id: Office['id'], { name }: Office) {
    const updateOffice = await prisma.office.update({
      where: { id },
      data: { name },
    });
    return updateOffice;
  }

  public static async addUser(
    id: Office['id'],
    data: Pick<UserToOffice, 'usersId'>[]
  ) {
    const addUsersOnOffice = await prisma.office.update({
      where: { id },
      data: {
        users: { createMany: { data, skipDuplicates: true } },
      },
    });
    return addUsersOnOffice;
  }
}
export default OfficeServices;
