import { z } from "zod";

const emailSchema = z.object({
  subject: z
    .string()
    .min(5)
    .max(100)
    .describe("La línea de asunto cautivadora que capta la atención."),
  preview: z
    .string()
    .min(10)
    .max(150)
    .describe(
      "Un texto de vista previa conciso que incita a los destinatarios a abrir el correo electrónico."
    ),
  heading: z
    .string()
    .min(5)
    .max(50)
    .describe("El encabezado audaz y convincente de tu correo electrónico."),
  content: z
    .string()
    .min(50)
    .max(1000)
    .describe(
      "El contenido principal de tu correo electrónico. Cuenta una historia, proporciona valor e incluye una llamada a la acción clara."
    ),
});

const createAIEmail = async (prompt: string) => {
  
};
