import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["user", "admin"], { 
    errorMap: () => ({ message: "Selecciona un rol válido" }) 
  }),
});