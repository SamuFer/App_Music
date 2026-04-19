import {Router} from 'express';
import {UserController} from '../controllers/users.js';

export const useresRouter = Router();

useresRouter.get('/', UserController.getAll)

useresRouter.get('/:id', UserController.getId)

useresRouter.post('/',UserController.create)