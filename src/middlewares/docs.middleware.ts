import { Router } from 'express';
// import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

class Docs {
  public readonly router: Router;
  constructor() {
    this.router = Router();
    this.setUpRouter();
  }

  setUpRouter() {
    const swaggerDocument = YAML.load('./swagger.yaml');
    // const options = {
    //   customCssUrl: '/file-user/css/custom.css',
    // };
    this.router.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
  }
}

const { router } = new Docs();
export default router;
