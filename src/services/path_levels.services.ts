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
    const stage = await prisma.stages.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        project: { select: { id: true, name: true } },
      },
    });
    if (!stage)
      throw new AppError('Oops!,No pudimos encontrar el directorio', 404);
    return stage;
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
    const { name, project } = await StageInfo.findStage(id);
    if (!project) throw new AppError('Oops!,ID no encontrado', 400);
    const pathProject = await this.pathProject(project.id);
    return pathProject + '/' + name;
  }
  static async pathLevel(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findLevel = await prisma.levels.findUnique({ where: { id } });
    if (!findLevel) throw new AppError('Oops!,No hay el directorio', 404);
    const { stagesId } = findLevel;
    if (!stagesId) throw new AppError('Oops!,No hay el directorio', 404);
    const projectPath = await this.pathStage(stagesId);
    const path = await StageInfo.getValues(id);
    return projectPath + '/' + path;
  }
}
export default PathLevelServices;
