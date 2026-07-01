import { z } from 'zod';

export const themeSchema = z.object({
  day: z
    .string() // Los inputs de tipo number en HTML a veces devuelven string, Zod lo valida y luego lo convertimos
    .min(1, "El número de día es obligatorio")
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

  status: z.enum(["Upcoming", "Active"], {
    errorMap: () => ({ message: "Selecciona un estado válido" }),
  }),
});