import { UserService } from '../../services/user.service.js';
import { AppError } from '../../utils/customError.js';

export const AdminAuthController = class {
  
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError("El correo electrónico y la contraseña son obligatorios.", 400);
      }

      // 1. Buscamos el usuario por su email directamente en la base de datos
      const user = await UserService.getByEmailWithPassword(email);
      
      if (!user) {
        throw new AppError("Credenciales incorrectas o usuario no registrado.", 401);
      }

      // 🟢 ÚNICO CAMBIO: Validar si la cuenta está desactivada por Soft Delete
      if (!user.isActive) {
        throw new AppError("Esta cuenta ha sido desactivada. Ponte en contacto con soporte.", 403);
      }

      // 2. Verificación de contraseña 
      const isMatch = user.password === password; 

      if (!isMatch) {
        throw new AppError("Credenciales incorrectas.", 401);
      }

      // 3. Control de Autorización estricto (Mantendremos solo a los admins aquí)
      if (user.role !== 'admin') {
        throw new AppError("Acceso denegado. No tienes permisos de administrador.", 403);
      }

      // 4. Limpieza: No enviamos la contraseña de vuelta al cliente
      const adminSession = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      return res.status(200).json({
        success: true,
        message: "Autenticación de administrador exitosa",
        user: adminSession
      });

    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: `// ${error.message}` });
      }
      return res.status(500).json({ error: `// Error interno durante el login: ${error.message}` });
    }
  }
};