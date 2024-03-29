import { Router } from 'express';
import {
  assignedSubTask,
  showSubTask,
  createSubTask,
  updateSubTask,
  deleteSubTasks,
  updateStatusSubTask,
  SubtaskControllers,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

import {
  _employee_role,
  // _admin_role,
  _mod_role,
} from '../middlewares/role.middleware';
import { validSubtaskByIdAndStatus } from '../middlewares/subtask.middleware';
import {
  assignUserBySubtask,
  resetStatusSubTask,
  updatePercentage,
} from '../controllers/subtasks.controllers';

const { addToUp } = SubtaskControllers;

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/:id', showSubTask);

// router.patch('/asigned/:id', taskVerify, assignedSubTask);
router.patch('/asigned/:id', assignedSubTask);
// router.post('/upload/:id', upload.single('myFiles'), uploadFileSubTask);
// router.delete('/deleteFile/:id/:filename', deleteFileSubTask);
router.patch('/status/:id/:stageId', updateStatusSubTask);
router.patch('/resetStatus/:id/:stageId', resetStatusSubTask);
// router.patch('/pdf/:id', updateStatusSubTask);
router.patch('/percentage/:id', updatePercentage);

//MOD ROLE
router.use(_mod_role);
router.post('/', createSubTask);
router.patch('/:id', updateSubTask);
router.patch('/assignUser/:id/:stageId', assignUserBySubtask);
router.post('/:id/:stageId', addToUp);
router.delete('/:id/:stageId', validSubtaskByIdAndStatus, deleteSubTasks);

export default router;
