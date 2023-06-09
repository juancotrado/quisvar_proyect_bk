import AppError from '../utils/appError';
import {
  FileTypes,
  Files,
  SubTasks,
  Users,
  prisma,
} from '../utils/prisma.server';
import PathServices from './paths.services';
import fs from 'fs';
// awa
class FilesServices {
  static async findBySubTask(subTasksId: SubTasks['id'], type: Files['type']) {
    if (!subTasksId) throw new AppError(`Oops!! id invalido`, 404);
    const filesList = await prisma.files.findMany({
      where: { subTasksId, type },
    });
    if (!filesList)
      throw new AppError(`no se pudo encontrar la lista de archivos`, 404);
    return filesList;
  }

  static async createManyFiles(
    data: {
      dir: string;
      type: FileTypes;
      subTasksId: number;
      name: string;
      userId: number;
    }[],
    subTasksId: SubTasks['id']
  ) {
    const subTask = await prisma.subTasks.findUnique({
      where: { id: subTasksId },
    });
    if (!subTask) throw new AppError(`no se pudo encontrar la subtarea`, 404);
    const newFile = await prisma.files.createMany({
      data: data,
    });
    return newFile;
  }
  static async create(
    subTasksId: Files['subTasksId'],
    filename: string,
    type: Files['type'],
    userId: Users['id']
  ) {
    const subTask = await prisma.subTasks.findUnique({
      where: { id: subTasksId },
    });
    if (!subTask) throw new AppError(`no se pudo encontrar la subtarea`, 404);
    const dir = await PathServices.pathSubTask(subTasksId, 'REVIEW');
    const newFile = await prisma.files.create({
      data: {
        dir,
        type,
        subTasksId,
        name: filename,
        userId,
      },
    });
    return newFile;
  }

  static async getSubTask(id: SubTasks['id']) {
    if (!id) throw new AppError('Opps!, id invalido', 400);
    const subTask = await prisma.subTasks.findFirst({
      where: { id },
      select: { name: true, item: true },
    });
    if (!subTask) throw new AppError(`no se pudo encontrar la subtarea`, 404);
    return subTask;
  }
  static async delete(id: Files['id']) {
    if (!id) throw new AppError('Opps!, id invalido', 400);
    const getFile = await prisma.files.findUnique({ where: { id } });
    const deleteFile = await prisma.files.delete({ where: { id } });
    if (!getFile) throw new AppError('No se pudo encontrar el archivo', 404);
    if (getFile.type === 'SUCCESSFUL')
      throw new AppError(
        'No se puede eliminar archivo, porque se marco como hecho',
        400
      );
    const path = await PathServices.pathSubTask(
      getFile.subTasksId,
      getFile.type
    );
    fs.unlinkSync(`${path}/${getFile.name}`);
    return deleteFile;
  }
  static async parsePath(
    id: number,
    type: 'PROYECT' | 'AREA' | 'INDEXTASK' | 'TASK'
  ) {
    // if (type === 'PROYECT') {
    //   await prisma.projects.update({
    //     where: { id },
    //     data: {
    //       dir: ``,
    //       areas: {
    //         updateMany: {
    //           where: { projectId: id },
    //           data: {
    //           },
    //         },
    //       },
    //     },
    //   });
    // }
  }
}

export default FilesServices;
