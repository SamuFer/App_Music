import {Router} from 'express';
import {UserController} from '../controllers/users.js';

export const usersRouter = Router();

usersRouter.get('/', UserController.getAll)

usersRouter.get('/:id', UserController.getId)

usersRouter.post('/',UserController.create)