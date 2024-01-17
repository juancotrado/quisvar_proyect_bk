import { Router } from 'express';
import authenticateHandler from '../middlewares/auth.middleware';
import { ContractController } from '../controllers';
import { uploads } from '../middlewares';
// import { uploadFileContracts } from '../middlewares/upload.middleware';

class ContractRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.setUpRoutes();
  }
  private setUpRoutes() {
    this.router.use(authenticateHandler);
    this.router.get('/', ContractController.showContracts);
    this.router.get('/:id', ContractController.showContract);
    this.router.post('/', ContractController.createContract);
    this.router.post(
      '/:id/files',
      uploads.contractFile.single('fileContract'),
      ContractController.uploadFiles
    );
    this.router.patch('/:id', ContractController.updateContract);
    this.router.put('/:id/index', ContractController.updateIndex);
    this.router.put('/:id/details', ContractController.updateDetails);
    this.router.put('/:id/phases', ContractController.updatePhases);
    this.router.delete('/:id', ContractController.deleteContract);
    this.router.delete('/:id/files', ContractController.deleteFiles);
  }
}

const { router } = new ContractRoutes();
export default router;
