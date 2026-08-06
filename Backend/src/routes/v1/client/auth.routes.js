import { Router } from 'express'
import { ClientAuthController } from '../../../controllers/client/auth.controller.js'
import { userValidatorRequest } from '../../../middlewares/validators/user.validator.js'

export const clientAuthRoutes = Router()

// Endpoint: POST /api/v1/auth/register
clientAuthRoutes.post('/register', userValidatorRequest, ClientAuthController.register)

// Endpoint: POST /api/v1/auth/login
clientAuthRoutes.post('/login', userValidatorRequest, ClientAuthController.login)
