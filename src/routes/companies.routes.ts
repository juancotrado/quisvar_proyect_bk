import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createCompany,
  deleteImgCompanies,
  getCompaniesById,
  getCompany,
  updateCompaniesById,
  updateImgCompanies,
} from '../controllers';
import { _admin_role } from '../middlewares/role.middleware';
import { uploadImgCompanies } from '../middlewares/upload.middleware';
const router = Router();
router.use(authenticateHandler);
router.use(_admin_role);
router.get('/', getCompany);
router.get('/information/:id', getCompaniesById);
router.patch('/:id', updateCompaniesById);
router.post('/', uploadImgCompanies.fields([{ name: 'img' }]), createCompany);
//COMPANIES IMG
router.patch(
  '/img/:id',
  uploadImgCompanies.fields([{ name: 'img' }]),
  updateImgCompanies
);
router.delete('/img/:id', deleteImgCompanies);
export default router;
