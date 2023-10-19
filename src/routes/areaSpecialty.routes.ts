import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createAreaSpecialty,
  deleteAreaSpecialty,
  getAreaSpecialty,
  uploadAreaSpecialty,
} from '../controllers';
import { _admin_role } from '../middlewares/role.middleware';
import { uploadFileAreaSpecialty } from '../middlewares/upload.middleware';
const router = Router();
router.use(authenticateHandler);
router.use(_admin_role);
router.get('/:id', getAreaSpecialty);
router.post(
  '/',
  uploadFileAreaSpecialty.fields([{ name: 'file' }]),
  createAreaSpecialty
);
router.patch('/:id', uploadAreaSpecialty);
router.delete('/:id', deleteAreaSpecialty);
export default router;
