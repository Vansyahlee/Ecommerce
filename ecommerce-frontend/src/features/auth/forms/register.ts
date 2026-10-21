import * as z from "zod";

export const RegisterFormSchema = z.object({
  firstName: z.string().min(2, "Minimal 2 karakter"),
  lastName: z.string().min(2, "Minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Minimal 8 karakter").regex(/[A-Z]/, "Harus ada huruf besar").regex(/[0-9]/, "Harus ada angka"),
});

export type RegisterFormSchemaType = z.infer<typeof RegisterFormSchema>;