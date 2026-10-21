import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (inferAdditionalFields as any)({
      user: {
        fields: {
          role: { type: "string" },
          username: { type: "string" },
          isBlocked: { type: "boolean" },
          lastLogin: { type: "string" },
        },
      },
    }),
  ],
});

const errorCodes = {
  USER_ALREADY_EXISTS: {
    en: "User already registered",
    es: "Usuario ya registrada",
    id: "Email sudah terdaftar",
    ru: "Пользователь sudah зарегистрирован",
  },
  USER_IS_BLOCKED: {
    en: "Your account has been blocked by administrator",
    es: "Tu cuenta ha sido bloqueada",
    id: "Akun Anda telah diblokir oleh administrator",
    ru: "Ваш аккаунт заблокирован",
  },
};

export const getErrorMessage = (code: string, lang: "en" | "es" | "id" | "ru") => {
  const typedErrorCodes = errorCodes as Record<string, Record<string, string>>;
  if (code in typedErrorCodes) {
    return typedErrorCodes[code][lang];
  }
  return "";
};