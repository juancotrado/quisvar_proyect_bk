import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createSpecialist,
  deleteSpecialist,
  getSpecialist,
  getSpecialistByDNI,
  getSpecialistById,
  updateSpecialist,
} from '../controllers';
import { _admin_role } from '../middlewares/role.middleware';
import { uploads } from '../middlewares';
const router = Router();
router.use(authenticateHandler);
router.use(_admin_role);
router.get('/', getSpecialist);
router.patch('/:id', updateSpecialist);
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
router.delete('/delete/:id', deleteSpecialist);
export default router;
