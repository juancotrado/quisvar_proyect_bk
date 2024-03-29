import { Router } from 'express';
import { AuthController } from '../controllers';
import authenticateHandler from '../middlewares/auth.middleware';

class AuthRouter {
  public readonly router: Router;

  constructor() {
    this.router = Router();
    this.setUp();
  }

  public setUp() {
    const { login, recoverPassword, queryroute, forgotPassword, newPassword } =
      AuthController;
    this.router.get('/query', queryroute);
    this.router.post('/login', login);
    this.router.post('/forgot-password', forgotPassword);
    this.router.post('/new-password', newPassword);
    this.router.use(authenticateHandler);
    this.router.post('/recovery', recoverPassword);
  }
}

const { router } = new AuthRouter();

export default router;
