import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import {
  createList,
  getAllListByDate,
  getListById,
  updateAttendance,
  updateList,
  userAttendance,
} from '../controllers';
const router = Router();
router.use(authenticateHandler);
router.post('/', createList);
router.patch('/:id', updateList);
router.get('/attendance', getAllListByDate);
router.post('/attendance/:id', userAttendance);
router.patch('/attendance/:id', updateAttendance);
router.get('/:id', getListById);
export default router;
