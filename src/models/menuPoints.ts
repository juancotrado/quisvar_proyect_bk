import { MenuRol } from '@prisma/client';

interface Menu {
  id: number;
  title: string;
  route: string;
  menu?: RoleMenu[];
}
interface subMenu {
  [key: number]: Menu[];
}
interface Role {
  id: number;
  name: string;
  menuPoints: RoleMenu[];
}
interface RoleMenu {
  menuId: number;
  typeRol: MenuRol;
  menu?: Menu;
  subMenuPoints?: RoleMenu[];
}
interface MenuHeader {
  id: number;
  typeRol: MenuRol;
  route: string;
  title: string;
  menu?: (MenuHeader | undefined)[] | null;
}
export class MenuPoints {
  private menuPoints: Menu[] = MENU_POINTS;
  private subMenuPoints: subMenu = SUBMENU_POINTS;

  public roleTransform(data: Role) {
    const { menuPoints, name, id } = data;
    const newMenuPoints: (MenuHeader | undefined)[] = menuPoints.map(
      menuPoint => {
        const { menuId, typeRol, subMenuPoints } = menuPoint;
        const findMenu = this.menuPoints.find(({ id }) => id === menuId);
        if (!findMenu) return;
        const { id, route, title } = findMenu;
        let menu: (MenuHeader | undefined)[] | null = null;
        if (subMenuPoints && subMenuPoints.length > 0) {
          const subMenus = this.subMenuPoints[menuId] ?? null;
          if (subMenus) {
            menu = subMenuPoints.map(subMenuPoint => {
              const { menuId, typeRol } = subMenuPoint;
              const findSubMenu = subMenus.find(({ id }) => id === menuId);
              if (!findSubMenu) return;
              const { id, route, title } = findSubMenu;
              return { id, typeRol, route, title };
            });
          }
        }
        const menuPointsValues: MenuHeader = { id, typeRol, route, title };
        if (menu) {
          menuPointsValues.menu = menu;
        }
        return menuPointsValues;
      }
    );

    return { name, id, menu: newMenuPoints };
  }
  public getHeadersOptions(data: Role) {
    const { id, name, menu } = this.roleTransform(data);
    const menuFilter = menu.filter(men => !!men) as MenuHeader[];
    const menuPoints = menuFilter.map(({ id, route, title, typeRol }) => ({
      id,
      route,
      title,
      typeRol,
    }));
    return { id, name, menuPoints };
  }
}

const MENU_POINTS: Menu[] = [
  { id: 1, title: 'Inicio', route: 'home' },
  { id: 2, title: 'Tramites', route: 'tramites' },
  {
    id: 3,
    title: 'Proyectos',
    route: 'especialidades',
  },
  {
    id: 4,
    title: 'Asistencia',
    route: 'asistencia',
  },
  { id: 5, title: 'Usuarios', route: 'lista-de-usuarios' },

  {
    id: 6,
    title: 'Empresas',
    route: 'empresas',
  },
  {
    id: 7,
    title: 'Especialistas',
    route: 'especialistas',
  },
  {
    id: 8,
    title: 'Indice General',
    route: 'indice-general',
  },
  {
    id: 9,
    title: 'Grupos',
    route: 'grupos',
  },
];

export const INDICE_GENERAL_OPTIONS: Menu[] = [
  { id: 14, title: 'CAEC', route: 'contratos' },
  { id: 13, title: 'DEE', route: 'contratos1' },
  { id: 12, title: 'DEP', route: 'contratos2' },
  { id: 11, title: 'CF', route: 'contratos3' },
  { id: 10, title: 'DCA,CC', route: 'contratos4' },
  { id: 9, title: 'SUNAT', route: 'contratos5' },
  { id: 8, title: 'OSCE', route: 'contratos6' },
  { id: 7, title: 'Imagen Inst', route: 'contratos7' },
  { id: 6, title: 'CPE', route: 'contratos8' },
  { id: 5, title: 'DIEB', route: 'contratos8' },
  { id: 4, title: 'DRP', route: 'contratos8' },
  { id: 3, title: 'DPP', route: 'contratos8' },
  { id: 2, title: 'AC', route: 'contratos8' },
  { id: 1, title: 'DTI', route: 'contratos8' },
];

export const TRAMITES_OPTIONS: Menu[] = [
  { id: 4, title: 'Trámite de pagos', route: 'contratos8' },
  { id: 3, title: 'Trámite interactivo', route: 'contratos8' },
  { id: 2, title: 'Proceso unilateral', route: 'contratos8' },
  { id: 1, title: 'Salidas', route: 'contratos8' },
];

const SUBMENU_POINTS: subMenu = {
  2: TRAMITES_OPTIONS,
  8: INDICE_GENERAL_OPTIONS,
};
