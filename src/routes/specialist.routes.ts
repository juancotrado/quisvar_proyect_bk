import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createSpecialist,
  getSpecialist,
  getSpecialistByDNI,
  getSpecialistById,
} from '../controllers';
import { _admin_role } from '../middlewares/role.middleware';
import { uploads } from '../middlewares';
const router = Router();
router.use(authenticateHandler);
router.use(_admin_role);
router.get('/', getSpecialist);
router.get('/dni/:dni', getSpecialistByDNI);
router.get('/information/:id', getSpecialistById);
router.post(
  '/',
  uploads.fileSpecialist.fields([
    { name: 'fileAgreement' },
    { name: 'fileCv' },
  ]),
  createSpecialist
);
export default router;
