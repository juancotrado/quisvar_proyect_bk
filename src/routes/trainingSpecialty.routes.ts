import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import { createTrainingSpecialty, getTrainingSpecialty } from '../controllers';
import { _admin_role } from '../middlewares/role.middleware';
import { uploadFileTrainingSpecialty } from '../middlewares/upload.middleware';
const router = Router();
router.use(authenticateHandler);
router.use(_admin_role);
router.get('/:id', getTrainingSpecialty);
router.post(
  '/',
  uploadFileTrainingSpecialty.fields([{ name: 'trainingFile' }]),
  createTrainingSpecialty
);
export default router;
