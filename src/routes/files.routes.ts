import { Router } from 'express';

import authenticateHandler from '../middlewares/auth.middleware';
import { _employee_role, _admin_role } from '../middlewares/role.middleware';
import { deleteFile, uploadFile, uploadFiles } from '../controllers';
import {
  deleteFilesGeneral,
  deleteUserFile,
  showFilesGeneral,
  uploadFilesGeneral,
  uploadUserFile,
} from '../controllers/files.controllers';
import { uploads } from '../middlewares';

const router = Router();
// router.get('/download', downloadProfile);
router.get('/');
router.use(authenticateHandler);
//EMPLOYEE ROLE
router.use(_employee_role);
router.post(
  '/uploadFileUser/:id',
  uploads.fileUser.single('fileUser'),
  uploadUserFile
);
router.delete('/removeFileUser/:id/:filename', deleteUserFile);

router.post(
  '/uploadGeneralFiles',
  uploads.generalFiles.single('generalFile'),
  uploadFilesGeneral
);
router.get('/generalFiles', showFilesGeneral);
router.delete('/generalFiles/:id', deleteFilesGeneral);
router.post('/upload/:id', uploads.upload.single('file'), uploadFile);
router.post('/uploads/:id', uploads.upload.array('files'), uploadFiles);
router.delete('/remove/:id', deleteFile);
//ADMIN ROLE
router.use(_admin_role);
router.post('/');

export default router;
