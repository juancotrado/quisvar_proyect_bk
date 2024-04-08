import { ProfileByRoleType } from 'types/types';
import { Office, prisma, UserToOffice } from '../utils/prisma.server';
import Queries from '../utils/queries';

class OfficeServices {
  public static async getAll(
    userId: number,
    { typeRol, menuId, subMenuId: id }: ProfileByRoleType
  ) {
    console.log({ typeRol, menuId, id });
    const getListOffice = await prisma.office.findMany({
      include: {
        users: {
          where: {
            user: {
              id: { notIn: [userId] },
              role: {
                menuPoints: {
                  every: { subMenuPoints: { every: { typeRol, menuId, id } } },
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
    return getListOffice;
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
