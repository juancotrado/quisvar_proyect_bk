import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import { ContractController } from '../controllers';
import { uploadFileContracts } from '../middlewares/upload.middleware';

class ContractRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRoutes();
  }
  private setUpRoutes() {
    // this.router.use(authenticateHandler);
    this.router.get('/', ContractController.showContracts);
    this.router.get('/:id', ContractController.showContract);
    this.router.post('/', ContractController.createContract);
    this.router.post(
      '/:id/files',
      uploadFileContracts.single('fileContract'),
      ContractController.uploadFiles
    );
    this.router.patch('/:id', ContractController.updateContract);
    this.router.delete('/:id', ContractController.deleteContract);
  }
}

const { router } = new ContractRoutes();
export default router;
