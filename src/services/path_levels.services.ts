import { _dirPath } from '.';
import AppError from '../utils/appError';
import { parsePath, parseProjectName } from '../utils/fileSystem';
import { prisma } from '../utils/prisma.server';

class StageInfo {
  static async findProject(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const project = await prisma.projects.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
    if (!project)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    return project;
  }
  static async findStage(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const project = await prisma.stages.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        projects: { select: { id: true, name: true } },
      },
    });
    if (!project)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    return project;
  }
  static async getValues(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findLevel = await prisma.levels.findUnique({ where: { id } });
    if (!findLevel) throw new AppError('Oops!,ID no encontrado', 400);
    const { rootId, item, name } = findLevel;
    if (!rootId) return item + name;
    const nextLevel: string = await this.getValues(rootId);
    return nextLevel + '/' + item + name;
  }
}

class PathLevelServices {
  static async pathProject(id: number) {
    const { name } = await StageInfo.findProject(id);
    return _dirPath + '/' + name;
  }
  static async pathStage(id: number) {
    const {} = await StageInfo.findStage(id);
  }
  static async pathLevel(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findLevel = await prisma.levels.findUnique({ where: { id } });
    if (!findLevel) throw new AppError('Oops!,No hay el directorio', 404);
    const { projectsId } = findLevel;
    if (!projectsId) throw new AppError('Oops!,No hay el directorio', 404);
    const projectPath = await PathLevelServices.pathProject(projectsId);
    const path = await StageInfo.getValues(id);
    return projectPath + '/' + path;
  }
}
export default PathLevelServices;
