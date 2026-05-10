import {Router} from 'express';
import {UserClientController} from '../../../controllers/client/user.controller.js';

export const clientUserRoutes = Router();

clientUserRoutes.get('/', UserClientController.getAll)

// clientUserRoutes.get('/:id', UserClientController.getId)

// clientUserRoutes.post('/', UserController.create)
