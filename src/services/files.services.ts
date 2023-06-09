import { Files, prisma } from '../utils/prisma.server';

// awa
class FilesServices {
  static async create({ dir, userId, subTasksId }: Files, type: Files['type']) {
    if (type === 'MATERIAL') {
      // asdas
    }
    const newFile = await prisma.files.create({
      data: {
        type,
        userId,
        subTasksId,
      },
    });
  }
  static async delete() {}
  static async parsePath(
    id: number,
    type: 'PROYECT' | 'AREA' | 'INDEXTASK' | 'TASK'
  ) {
    if (type === 'PROYECT') {
      await prisma.projects.update({
        where: { id },
        data: {
          dir: ``,
          areas: {
            updateMany: {
              where: { projectId: id },
              data: {
                dir: ``,
              },
            },
          },
        },
      });
    }
  }
}
