import { z } from 'zod';

// Esquema base con las propiedades comunes
const baseUserSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  role: z.enum(["user", "admin"], { 
    errorMap: () => ({ message: "Selecciona un rol válido" }) 
  }),
});

// 1. Esquema para CREAR (Contraseña obligatoria)
export const createUserSchema = baseUserSchema.extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// 2. Esquema para EDITAR (Contraseña opcional o string vacío)
export const updateUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional()
    .or(z.literal('')),
});

// Mantenemos userSchema por retrocompatibilidad por si lo usas en otro sitio
export const userSchema = createUserSchema;