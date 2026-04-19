import {Router} from 'express';
import {UserController} from '../../controllers/client/user.controller.js';

export const usersRouter = Router();

usersRouter.get('/', UserController.getAll)

// usersRouter.get('/:id', UserController.getId)

// usersRouter.post('/', UserController.create)
