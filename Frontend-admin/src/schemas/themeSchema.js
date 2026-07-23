import { z } from 'zod';

export const themeSchema = z.object({
  day: z
    .union([z.string(), z.number()]) // 👈 Acepta tanto texto "11" como número 11
    .transform((val) => String(val)) // 🔄 Lo convierte todo a string para uniformar
    .refine((val) => val.trim().length > 0, "El número de día es obligatorio")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Debe ser un número mayor a 0",
    }),

  title: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),

  startDate: z
    .string()
    .min(1, "La fecha de inicio es obligatoria"),

  votingDeadline: z
    .string()
    .min(1, "La fecha de cierre es obligatoria"),

  // 🔄 Flexibilidad de estados: Acepta mayúsculas o minúsculas y las transforma a minúsculas
  status: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(z.enum(["upcoming", "active", "closed"], {
      errorMap: () => ({ message: "Selecciona un estado válido" }),
    })),
})
.refine((data) => {
  // 🕒 REGLA DE ORO PARA PRUEBAS:
  // La fecha límite de votación debe ser mayor al momento actual ("ahora")
  const ahora = new Date();
  return new Date(data.votingDeadline) > ahora;
}, {
  message: "La fecha de cierre de votación debe ser una fecha futura",
  path: ["votingDeadline"],
})
.refine((data) => {
  // Coherencia interna obligatoria: El cierre siempre debe ser posterior al inicio
  return new Date(data.votingDeadline) > new Date(data.startDate);
}, {
  message: "La fecha de cierre debe ser posterior a la fecha de inicio",
  path: ["votingDeadline"],
});