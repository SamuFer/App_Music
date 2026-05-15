import { Router } from "express"
import { ThemeAdminController } from "../../../controllers/admin/theme.controller.js"

export const adminThemeRoutes = Router()

adminThemeRoutes.get('/', ThemeAdminController.getAll)
adminThemeRoutes.post('/', ThemeAdminController.create)