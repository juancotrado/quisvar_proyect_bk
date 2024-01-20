import { MenuPoints } from './../models/menuPoints';
import AppError from '../utils/appError';
import { RoleForMenuPick } from '../utils/format.server';
import { Role, prisma } from '../utils/prisma.server';

const menuPoints = new MenuPoints();
class RoleService {
  static async getAll() {
    const roles = await prisma.role.findMany({
      include: {
        menuPoints: {
          select: {
            menuId: true,
            typeRol: true,
            subMenuPoints: {
              select: {
                menuId: true,
                typeRol: true,
              },
            },
          },
        },
      },
    });
    if (roles.length === 0) throw new AppError('Aun no se creo ningu rol', 404);
    return roles;
  }
  static async find(id: Role['id']) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        menuPoints: {
          select: {
            id: true,
            menuId: true,
            typeRol: true,
            subMenuPoints: {
              select: {
                id: true,
                menuId: true,
                typeRol: true,
              },
            },
          },
        },
      },
    });
    if (!role) throw new AppError('No se pudo encontrar el rol', 404);
    return role;
  }

  static async findGeneral(id: Role['id']) {
    const role = await RoleService.find(id);
    console.log(role);
    const menusWithRole = menuPoints.getMenuPoints(role);
    return menusWithRole;
  }
  static async create({ name, menuPoints }: RoleForMenuPick) {
    console.log(name, menuPoints);
    const role = await prisma.role.create({
      data: {
        name,
      },
    });

    for (const { menuId, typeRol, subMenuPoints } of menuPoints) {
      console.log(menuId, typeRol, subMenuPoints);
      await prisma.menuPoints.create({
        data: {
          menuId,
          typeRol,
          roleId: role.id,
          subMenuPoints: {
            createMany: {
              data: subMenuPoints ?? [],
            },
          },
        },
      });
    }
    const getRole = await RoleService.find(role.id);

    return getRole;
  }
  static async edit({ name, menuPoints }: RoleForMenuPick, id: number) {
    const role = await prisma.role.upsert({
      where: { id },
      update: { name },
      create: {
        name,
      },
    });

    for (const menuPointData of menuPoints) {
      const { id: menuPointId, menuId, typeRol, subMenuPoints } = menuPointData;

      await prisma.menuPoints.upsert({
        where: { id: menuPointId },
        update: {
          typeRol,
          menuId,
        },
        create: {
          typeRol,
          menuId,
          roleId: role.id,
        },
      });

      for (const subMenuPointData of subMenuPoints || []) {
        const {
          id,
          menuId: subMenuId,
          typeRol: subMenuTypeRol,
        } = subMenuPointData;

        await prisma.subMenuPoints.upsert({
          where: { id },
          update: {
            typeRol: subMenuTypeRol,
            menuId: subMenuId,
          },
          create: {
            typeRol: subMenuTypeRol,
            menuId: subMenuId,
            menuPointsId: menuPointId,
          },
        });
      }
    }
    const getRole = await RoleService.find(role.id);

    return getRole;
  }
}

export default RoleService;
