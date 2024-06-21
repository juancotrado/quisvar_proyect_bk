import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createList,
  deleteManyList,
  fixShitsDiego,
  getAllListByDate,
  getListById,
  getListRange,
  updateAttendance,
  updateList,
  userAttendance,
} from '../controllers';
import { _admin_role } from '../middlewares/role.middleware';
const router = Router();
router.use(authenticateHandler);
//Admin role
// router.use(_admin_role);
router.post('/', createList);
router.delete('/', deleteManyList);
router.patch('/:id', updateList);
router.get('/attendance', getAllListByDate);
router.post('/attendance/:id', userAttendance);
router.post('/fix', fixShitsDiego);
router.patch('/attendance/:id', updateAttendance);
router.get('/:id', getListById);
router.get('/attendance/range', getListRange);
export default router;
