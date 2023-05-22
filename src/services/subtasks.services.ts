// import {
//   Projects,
//   SubTasks,
//   Tasks,
//   Users,
//   prisma,
// } from '../utils/prisma.server';
// import AppError from '../utils/appError';

// class SubTasksServices {
//   static async find(id: SubTasks['id']) {
//     if (!id) throw new AppError('Oops!,Invalid ID', 400);
//     const findSubTask = await prisma.subTasks.findUnique({
//       where: { id },
//       include: {
//         tasks: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//       },
//     });
//     if (!findSubTask) throw new AppError('Could not found task ', 404);
//     return findSubTask;
//   }

//   static async create({
//     name,
//     price,
//     hours,
//     description,
//     taskId,
//   }: SubTasks & { taskId: Tasks['id'] }) {
//     const newTask = prisma.subTasks.create({
//       data: {
//         name,
//         price,
//         description,
//         hours,
//         tasks: {
//           connect: { id: taskId },
//         },
//       },
//     });
//     return newTask;
//   }

//   static async update(
//     id: SubTasks['id'],
//     { name, hours, price, description }: SubTasks
//   ) {
//     if (!id) throw new AppError('Oops!,Invalid ID', 400);
//     const updateTask = await prisma.subTasks.update({
//       where: { id },
//       data: {
//         name,
//         hours,
//         price,
//         description,
//       },
//     });
//     return updateTask;
//   }

//   static async delete(id: SubTasks['id']) {
//     if (!id) throw new AppError('Oops!,Invalid ID', 400);
//     const deleteTask = await prisma.subTasks.delete({
//       where: { id },
//     });
//     return deleteTask;
//   }
// }
// export default SubTasksServices;
