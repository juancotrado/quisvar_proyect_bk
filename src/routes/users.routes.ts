import { Router } from 'express';
import { showUsers } from '../controllers';
const router = Router()

router.get('/', showUsers)
export default router