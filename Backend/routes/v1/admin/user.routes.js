import {Router} from 'express';
import { UserAdminController } from '../../../controllers/admin/user.controller.js';

export const adminUserRoutes = Router();

adminUserRoutes.get('/', UserAdminController.getAll)
adminUserRoutes.get('/:id', UserAdminController.getById)
adminUserRoutes.post('/', UserAdminController.create)   
adminUserRoutes.put('/:id', UserAdminController.update)
adminUserRoutes.delete('/:id', UserAdminController.delete)  
