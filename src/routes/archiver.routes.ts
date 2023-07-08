import { Router } from 'express';
import {
  archiverPath,
  deleteArchiver,
} from '../controllers/archiver.controller';

const router = Router();
router.get('/:id', archiverPath);
router.delete('/', deleteArchiver);

export default router;
