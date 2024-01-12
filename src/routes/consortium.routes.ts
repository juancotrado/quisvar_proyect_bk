import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createConsortium,
  createRelationConsortium,
  deleteById,
  deleteImg,
  deleteRelationConsortium,
  getAllConsortium,
  getBoth,
  getConsortiumById,
  updateById,
  updateImg,
} from '../controllers';
import { _admin_role } from '../middlewares/role.middleware';
import { uploadImgConsortium } from '../middlewares/upload.middleware';
const router = Router();
router.use(authenticateHandler);
//Admin role
router.use(_admin_role);
router.post(
  '/',
  uploadImgConsortium.fields([{ name: 'img' }]),
  createConsortium
);
router.get('/all', getAllConsortium);
router.get('/:id', getConsortiumById);
router.patch('/:id', updateById);
router.delete('/:id', deleteById);
//CONSORTIUM IMG
router.patch(
  '/img/:id',
  uploadImgConsortium.fields([{ name: 'img' }]),
  updateImg
);
router.delete('/img/:id', deleteImg);
//CONSORTIUM AND COMPANIES
router.get('/both', getBoth);
//CONSORTIUM RELATION
router.post('/relation/:companiesId/:consortiumId', createRelationConsortium);
router.delete('/relation/:companiesId/:consortiumId', deleteRelationConsortium);
export default router;
