import { MenuPoints, MenuRoles } from './../models/menuPoints';
import AppError from '../utils/appError';
import { RoleForMenuPick } from '../utils/format.server';
import { Role, prisma } from '../utils/prisma.server';

const menuPoints = new MenuPoints();
class RoleService {
  static async getAllMenus() {
    const roles = await prisma.role.findMany({
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
      orderBy: {
        id: 'asc',
      },
    });
    if (roles.length === 0) throw new AppError('Aun no se creo ningu rol', 404);
    return roles;
  }
  static async getAllForForm() {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
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
  static async findAllGeneral() {
    const allRoles = await RoleService.getAllMenus();
    const allMenusWithRole = allRoles.map(role => ({
      ...menuPoints.getMenuOptions(role),
      menuPointsDb: role.menuPoints,
    }));
    return allMenusWithRole;
  }
  static async getAllMenusForAccess() {
    const allMenus = await RoleService.findAllGeneral();
    const getAllMenusForAccess = allMenus.map(menuAux => {
      return {
        ...menuAux,
        menuPoints: menuPoints.joinMenuRolAndMenuGeneral(
          menuAux.menuPoints as MenuRoles[]
        ),
      };
    });
    return getAllMenusForAccess;
  }
  static async findGeneral(id: Role['id']) {
    const role = await RoleService.find(id);
    const menusWithRole = menuPoints.getHeadersOptions(role);
    return menusWithRole;
  }

  static async create({ name, menuPoints }: RoleForMenuPick) {
    const roleHierarchy = await prisma.role.findFirst({
      select: {
        hierarchy: true,
      },
      orderBy: {
        hierarchy: 'desc',
      },
    });
    const maxHierarchy = roleHierarchy?.hierarchy || 0;
    const role = await prisma.role.create({
      data: {
        name,
        hierarchy: maxHierarchy + 1,
      },
    });

    for (const { menuId, typeRol, subMenuPoints } of menuPoints) {
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
  static async delete(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const deleteRole = await prisma.role.delete({
      where: { id },
    });
    return deleteRole;
  }
  static async editHierarchy(id: number, hierarchy: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const roleToMove = await prisma.role.findUnique({ where: { id } });
    await prisma.role.update({
      where: { id },
      data: { hierarchy },
    });
    const roles = await prisma.role.updateMany({
      where: {
        hierarchy: {
          gt: hierarchy,
          lt: roleToMove?.hierarchy,
        },
      },
      data: {
        hierarchy: {
          increment: 1,
        },
      },
    });

    return roles;
  }
  static async edit({ name, menuPoints }: RoleForMenuPick, id: number) {
    if (!name) throw new AppError('Asegurese de escribir un nombre', 404);
    const role = await prisma.role.upsert({
      where: { id },
      update: { name },
      create: {
        name,
      },
    });

    const menuRoleDb = await RoleService.find(id);
    menuRoleDb.menuPoints.forEach(async menu => {
      const findMenuRol = menuPoints.find(
        menuPoint => menuPoint.id === menu.id
      );
      if (!findMenuRol) {
        await prisma.menuPoints.delete({ where: { id: menu.id } });
      } else {
        menu.subMenuPoints.forEach(async subMenu => {
          const findSubMenuRol = findMenuRol.subMenuPoints.find(
            menuPoint => menuPoint.id === subMenu.id
          );

          if (!findSubMenuRol) {
            await prisma.subMenuPoints.delete({ where: { id: subMenu.id } });
          }
        });
      }
    });

    for (const menuPointData of menuPoints) {
      const { id: menuPointId, menuId, typeRol, subMenuPoints } = menuPointData;

      const existMenuPointId = menuPointId ?? 0;

      const menuUpsert = await prisma.menuPoints.upsert({
        where: { id: existMenuPointId },
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
        const existSubMenuPointId = id ?? 0;

        await prisma.subMenuPoints.upsert({
          where: { id: existSubMenuPointId },
          update: {
            typeRol: subMenuTypeRol,
            menuId: subMenuId,
          },
          create: {
            typeRol: subMenuTypeRol,
            menuId: subMenuId,
            menuPointsId: menuUpsert.id,
          },
        });
      }
    }
    const getRole = await RoleService.find(role.id);

    return getRole;
  }
}

export default RoleService;
