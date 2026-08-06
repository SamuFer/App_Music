import {Router} from 'express'
import { UserAdminController } from '../../../controllers/admin/user.controller.js'
import {userValidatorRequest} from '../../../middlewares/validators/user.validator.js'

export const adminUserRoutes = Router();

adminUserRoutes.get('/', UserAdminController.getAll)
adminUserRoutes.get('/:id', userValidatorRequest, UserAdminController.getById)
adminUserRoutes.post('/', userValidatorRequest, UserAdminController.create)   
adminUserRoutes.put('/:id', userValidatorRequest, UserAdminController.update)
adminUserRoutes.delete('/:id', userValidatorRequest,UserAdminController.delete)  
// PATCH o PUT para restaurar
adminUserRoutes.patch('/:id/restore', userValidatorRequest, UserAdminController.restore);
