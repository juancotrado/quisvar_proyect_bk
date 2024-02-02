import { MenuRol } from '@prisma/client';

export type MenuAccess =
  | 'home'
  | 'tramites'
  | 'especialidades'
  | 'asistencia'
  | 'centro-de-usuarios'
  | 'empresas'
  | 'especialistas'
  | 'indice-general'
  | 'grupos';

type MenuRole = 'MOD' | 'MEMBER' | 'VIEWER';
interface MenuGeneral {
  id: number;
  title: string;
  access: MenuRole[];
}
export interface MenuRoles {
  id: number;
  title: string;
  route: MenuAccess;
  typeRol: MenuRole;
  menu?: MenuRoles[];
}
interface Menu extends MenuGeneral {
  route: MenuAccess;
  menu?: SubMenu[];
}
interface SubMenu extends MenuGeneral {
  route: string;
}
interface RelationMenu {
  [key: number]: SubMenu[];
}
interface Role {
  id: number;
  name: string;
  menuPoints: RoleMenu[];
}
interface RoleMenu {
  id: number;
  menuId: number;
  typeRol: MenuRol;
  menu?: Menu;
  subMenuPoints?: RoleMenu[];
}
interface MenuHeader {
  id: number;
  idRelation: number;
  typeRol: MenuRol;
  route: string;
  title: string;
  menu?: (MenuHeader | undefined)[] | null;
}
export class MenuPoints {
  private _menuPoints: Menu[] = MENU_POINTS;
  private _subMenuPoints: RelationMenu = SUBMENU_POINTS;

  public roleTransform(data: Role) {
    const { menuPoints, name, id } = data;
    const newMenuPoints: (MenuHeader | undefined)[] = menuPoints.map(
      menuPoint => {
        const { menuId, typeRol, subMenuPoints, id: idRelation } = menuPoint;
        const findMenu = this._menuPoints.find(({ id }) => id === menuId);
        if (!findMenu) return;
        const { id, route, title } = findMenu;
        let menu: (MenuHeader | undefined)[] | null = null;
        if (subMenuPoints && subMenuPoints.length > 0) {
          const subMenus = this._subMenuPoints[menuId] ?? null;
          if (subMenus) {
            menu = subMenuPoints.map(subMenuPoint => {
              const { menuId, typeRol, id: idRelation } = subMenuPoint;
              const findSubMenu = subMenus.find(({ id }) => id === menuId);
              if (!findSubMenu) return;
              const { id, route, title } = findSubMenu;
              return { id, typeRol, route, title, idRelation };
            });
          }
        }
        const menuPointsValues: MenuHeader = {
          id,
          typeRol,
          route,
          title,
          idRelation,
        };
        if (menu) {
          menuPointsValues.menu = menu;
        }
        return menuPointsValues;
      }
    );

    return { name, id, menu: newMenuPoints };
  }

  public getMenuPoints = () => {
    const newMenuPoints = this._menuPoints.map(menuPoint => {
      const menu = this._subMenuPoints[menuPoint.id];
      if (menu) menuPoint.menu = menu;
      return menuPoint;
    });

    return newMenuPoints;
  };
  public getHeadersOptions(data: Role) {
    const { id, name, menu } = this.roleTransform(data);
    const menuFilter = menu.filter(men => !!men) as MenuHeader[];
    const menuPoints = menuFilter.map(({ id, route, title, menu }) => ({
      id,
      route,
      title,
      menu,
    }));
    const menuPointsOrder = menuPoints.sort((a, b) => a.id - b.id);
    return { id, name, menuPoints: menuPointsOrder };
  }
  public getMenuOptions(data: Role) {
    const { id, name, menu } = this.roleTransform(data);
    const menuFilter = menu.filter(men => !!men) as MenuHeader[];
    const menuPoints = menuFilter.map(
      ({ id, route, title, typeRol, idRelation, menu }) => ({
        id,
        route,
        title,
        typeRol,
        idRelation,
        menu,
      })
    );
    return { id, name, menuPoints };
  }

  public joinMenuRolAndMenuGeneral(menuRol: MenuRoles[]) {
    const newMenuPoint = this.getMenuPoints().map(menuPoint => {
      const findMenuRol = menuRol.find(menu => menu.id === menuPoint.id);
      const newSubMenu = menuPoint.menu?.map(subMenu => {
        const findSubMenuRol = findMenuRol?.menu?.find(
          menu => menu.id === subMenu.id
        );
        return findMenuRol ? { ...subMenu, ...findSubMenuRol } : menuPoint;
      });
      return findMenuRol
        ? { ...menuPoint, ...{ ...findMenuRol, menu: newSubMenu } }
        : menuPoint;
    });
    return newMenuPoint;
  }
}

const MENU_POINTS: Menu[] = [
  { id: 1, title: 'Inicio', route: 'home', access: ['MOD'] },
  { id: 2, title: 'Tramites', route: 'tramites', access: ['MOD'] },
  {
    id: 3,
    title: 'Proyectos',
    route: 'especialidades',
    access: ['MOD', 'VIEWER', 'MEMBER'],
  },
  {
    id: 4,
    title: 'Asistencia',
    route: 'asistencia',
    access: ['MOD'],
  },
  { id: 5, title: 'Usuarios', route: 'centro-de-usuarios', access: ['MOD'] },

  {
    id: 6,
    title: 'Empresas',
    route: 'empresas',
    access: ['MOD'],
  },
  {
    id: 7,
    title: 'Especialistas',
    route: 'especialistas',
    access: ['MOD'],
  },
  {
    id: 8,
    title: 'Indice General',
    route: 'indice-general',
    access: ['MOD'],
  },
  {
    id: 9,
    title: 'Grupos',
    route: 'grupos',
    access: ['MOD'],
  },
];

export const INDICE_GENERAL_OPTIONS: SubMenu[] = [
  { id: 1, title: 'DTI', route: 'contratos', access: ['MOD'] },
  { id: 2, title: 'AC', route: 'contratos', access: ['MOD'] },
  { id: 3, title: 'DPP', route: 'contratos', access: ['MOD'] },
  { id: 4, title: 'DRP', route: 'contratos', access: ['MOD'] },
  { id: 5, title: 'DIEB', route: 'contratos', access: ['MOD'] },
  { id: 6, title: 'CPE', route: 'contratos', access: ['MOD'] },
  { id: 7, title: 'Imagen Inst', route: 'contratos', access: ['MOD'] },
  { id: 8, title: 'OSCE', route: 'contratos', access: ['MOD'] },
  { id: 9, title: 'SUNAT', route: 'contratos', access: ['MOD'] },
  { id: 10, title: 'DCA,CC', route: 'contratos', access: ['MOD'] },
  { id: 11, title: 'CF', route: 'contratos', access: ['MOD'] },
  { id: 12, title: 'DEP', route: 'contratos', access: ['MOD'] },
  { id: 13, title: 'DEE', route: 'contratos', access: ['MOD'] },
  { id: 14, title: 'CAEC', route: 'contratos', access: ['MOD'] },
];

export const TRAMITES_OPTIONS: SubMenu[] = [
  { id: 1, title: 'Salidas', route: 'contratos8', access: ['MOD'] },
  { id: 2, title: 'Proceso unilateral', route: 'contratos8', access: ['MOD'] },
  { id: 3, title: 'Trámite interactivo', route: 'contratos8', access: ['MOD'] },
  { id: 4, title: 'Trámite de pagos', route: 'contratos8', access: ['MOD'] },
];

const SUBMENU_POINTS: RelationMenu = {
  2: TRAMITES_OPTIONS,
  8: INDICE_GENERAL_OPTIONS,
};
