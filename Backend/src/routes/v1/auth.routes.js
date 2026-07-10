import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller.js';

export const AuthRoutes = Router()

// Endpoint de login
AuthRoutes.post('/login', AuthController.login);

