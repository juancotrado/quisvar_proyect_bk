import { Router } from 'express';
import {
  assignedSubTask,
  showSubTask,
  createSubTask,
  updateSubTask,
  deleteSubTasks,
  updateStatusSubTask,
} from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

import {
  _employee_role,
  _admin_role,
  _mod_role,
} from '../middlewares/role.middleware';
import taskVerify from '../middlewares/user.middleware';
import {
  statusVerify,
  validSubtaskByIdAndStatus,
  validTaskById,
} from '../middlewares/subtask.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  assignUserBySubtask,
  deleteFileSubTask,
  uploadFileSubTask,
} from '../controllers/subtasks.controllers';

const router = Router();
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.get('/:id', showSubTask);

// router.patch('/asigned/:id', taskVerify, assignedSubTask);
router.patch('/asigned/:id', assignedSubTask);
router.post('/upload/:id', upload.single('myFiles'), uploadFileSubTask);
router.delete('/deleteFile/:id/:filename', deleteFileSubTask);
router.patch('/status/:id', statusVerify, updateStatusSubTask);

//MOD ROLE
router.use(_mod_role);
router.post('/', createSubTask);
router.patch('/:id', updateSubTask);
router.patch('/assignUser/:id', assignUserBySubtask);
router.delete('/:id', validSubtaskByIdAndStatus, deleteSubTasks);

export default router;
