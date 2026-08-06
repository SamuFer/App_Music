import { Router } from 'express'
import { AdminAuthController } from '../../../controllers/admin/auth.controller.js'
import { userValidatorRequest } from '../../../middlewares/validators/user.validator.js'

export const adminAuthRoutes = Router()

// Endpoint de login
adminAuthRoutes.post('/login', userValidatorRequest, AdminAuthController.login);

