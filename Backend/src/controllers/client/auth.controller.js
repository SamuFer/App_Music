import { UserService } from '../../services/user.service.js';
import { AppError } from '../../utils/customError.js';

export const ClientAuthController = class {

  // LOGIN PÚBLICO
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError("El correo electrónico y la contraseña son obligatorios.", 400);
      }

      const user = await UserService.getByEmailWithPassword(email);
      
      if (!user) {
        throw new AppError("Credenciales incorrectas o usuario no registrado.", 401);
      }

      // Validar si la cuenta está activa
      if (!user.isActive) {
        throw new AppError("Tu cuenta ha sido desactivada.", 403);
      }

      const isMatch = user.password === password;

      if (!isMatch) {
        throw new AppError("Credenciales incorrectas.", 401);
      }

      // 🟢 NOTA: Aquí NO filtramos por rol 'admin' para permitir el acceso a usuarios estándar ('user')

      const userSession = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      return res.status(200).json({
        success: true,
        message: "Autenticación exitosa",
        user: userSession
      });

    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: `// ${error.message}` });
      }
      return res.status(500).json({ error: `// Error interno durante el login: ${error.message}` });
    }
  }

  // REGISTRO PÚBLICO (Formulario de MusicTober)
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        throw new AppError("Todos los campos son obligatorios.", 400);
      }

      const newUser = await UserService.create({
        name: name,
        email,
        password,
        role: 'user'
      });

      return res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });

    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: `// ${error.message}` });
      }
      return res.status(500).json({ error: `// Error interno durante el registro: ${error.message}` });
    }
  }
};