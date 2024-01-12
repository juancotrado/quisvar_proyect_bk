import { Router } from 'express';

abstract class SetUpRouter {
  abstract setUpRouter(): void;
}

export interface InitialRouter extends SetUpRouter {
  router: Router;
}
