import { Socket, Server as WebSocketServer } from 'socket.io';
import { CatchAsync } from 'types/types';
import {
  DuplicatesServices,
  LevelsServices,
  StageServices,
  SubTasksServices,
} from '../../services';
import { SubTasks } from '@prisma/client';

type TaskStage = SubTasks & { stageId: number };

const budgetSocketCotroller = (
  socket: Socket,
  io: WebSocketServer,
  catchAsyncSocket?: CatchAsync
) => {
  const emitStage = async (stageId: number) => {
    const query = await StageServices.find(+stageId);
    io?.to(`project-${stageId}`).emit('server:budget-load-stage', query);
  };
  if (!catchAsyncSocket) return;

  socket.on(
    'client:update-task-days-budget',
    catchAsyncSocket(
      async (
        data: { id: number; days: number }[],
        stageId: number,
        callback: Function
      ) => {
        await LevelsServices.updateDaysPerId(data);
        await emitStage(stageId);
        callback();
      }
    )
  );
  socket.on(
    'client:add-task-budget',
    catchAsyncSocket(
      async ({ stageId, ...body }: TaskStage, callback: Function) => {
        await SubTasksServices.create(body);
        await emitStage(stageId);
        callback();
      }
    )
  );
  socket.on(
    'client:edit-task-budget',
    catchAsyncSocket(
      async ({ stageId, id, ...body }: TaskStage, callback: Function) => {
        await SubTasksServices.update(+id, body);
        await emitStage(stageId);
        callback();
      }
    )
  );
  socket.on(
    'client:delete-task-budget',
    catchAsyncSocket(async ({ stageId, id }: TaskStage, callback: Function) => {
      await SubTasksServices.delete(+id);
      await emitStage(stageId);
      callback();
    })
  );
  socket.on(
    'client:duplicate-task-budget',
    catchAsyncSocket(
      async ({ stageId, id, name }: TaskStage, callback: Function) => {
        await DuplicatesServices.subTask(id, name);
        await emitStage(stageId);
        callback();
      }
    )
  );
  socket.on(
    'client:upper-or-lower-task-budget',
    catchAsyncSocket(
      async (
        { stageId, id, description, name, days }: TaskStage,
        typeGte: 'upper' | 'lower',
        callback: Function
      ) => {
        const body = { description: description ?? '', name, days };
        await SubTasksServices.addToUper(+id, body, typeGte);
        await emitStage(stageId);
        callback();
      }
    )
  );
};

export default budgetSocketCotroller;
