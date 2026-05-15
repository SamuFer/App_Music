import { Router } from "express"
import { ThemeClientController } from "../../../controllers/client/theme.controller.js"

export const clientThemeRoutes = Router()

clientThemeRoutes.get('/today', ThemeClientController.getToday) 