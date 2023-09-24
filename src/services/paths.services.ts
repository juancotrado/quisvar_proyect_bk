import { ProjectDir } from 'types/types';
import { _dirPath, _materialPath, _reviewPath } from '.';
import AppError from '../utils/appError';
import { Files, prisma } from '../utils/prisma.server';

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
    const findLevel = await prisma.levels.findUnique({ where: { id } });
    if (!findLevel) throw new AppError('Oops!,ID no encontrado', 400);
    const { rootId, item, name } = findLevel;
    if (!rootId) return item + name;
    const nextLevel: string = await this.getValues(rootId);
    return nextLevel + '/' + item + name;
  }
  static async findSubtask(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findSubTask = await prisma.subTasks.findUnique({
      where: { id },
      include: { Levels: { select: { stages: true } } },
    });
    if (!findSubTask) throw new AppError('Oops!,No hay el directorio', 404);
    return findSubTask;
  }
}

class PathServices {
  static async project(id: number, type: ProjectDir) {
    const { name } = await StageInfo.findProject(id);
    if (type === 'MODEL') return _materialPath + '/' + name;
    if (type === 'REVIEW') return _reviewPath + '/' + name;
    return _dirPath + '/' + name;
  }
  static async stage(id: number, type: ProjectDir) {
    const { name, project } = await StageInfo.findStage(id);
    if (!project) throw new AppError('Oops!,ID no encontrado', 400);
    const pathProject = await PathServices.project(project.id, type);
    return pathProject + '/' + name;
  }
  static async level(id: number) {
    if (!id) throw new AppError('Oops!,ID invalido', 400);
    const findLevel = await prisma.levels.findUnique({ where: { id } });
    if (!findLevel) throw new AppError('Oops!,No hay el directorio', 404);
    const { stagesId } = findLevel;
    const projectPath = await PathServices.stage(stagesId, 'UPLOADS');
    const path = await StageInfo.getValues(id);
    return projectPath + '/' + path;
  }
  static async subTask(id: number, type: Files['type']) {
    const { levels_Id, Levels } = await StageInfo.findSubtask(id);
    const { stages } = Levels;
    if (type === 'UPLOADS') {
      const levelPath = await PathServices.level(levels_Id);
      return levelPath;
    }
    const rootPath = await PathServices.stage(stages.id, type);
    return rootPath;
  }
}
export default PathServices;
