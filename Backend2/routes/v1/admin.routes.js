import {Router} from 'express';
import { UserAdminController } from '../../controllers/admin/user.admin.controller.js';

export const adminRouter = Router();

adminRouter.get('/', UserAdminController.getAll)
adminRouter.get('/:id', UserAdminController.getById)
adminRouter.post('/', UserAdminController.create)   
adminRouter.put('/:id', UserAdminController.update)
adminRouter.delete('/:id', UserAdminController.delete)  
