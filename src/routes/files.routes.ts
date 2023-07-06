import { Router } from 'express';

import authenticateHandler from '../middlewares/auth.middleware';
import { _employee_role, _admin_role } from '../middlewares/role.middleware';
import {
  deleteFile,
  showProfile,
  updateProfile,
  uploadFile,
  uploadFiles,
} from '../controllers';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
// router.get('/download', downloadProfile);
router.get('/');
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.post('/upload/:id', upload.single('file'), uploadFile);
router.post('/uploads/:id', upload.array('files'), uploadFiles);
router.delete('/remove/:id', deleteFile);
//ADMIN ROLE
router.use(_admin_role);
router.post('/');

export default router;
