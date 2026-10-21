import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoginFormSchema, LoginFormSchemaType } from "../forms/login";
import { authClient, getErrorMessage } from "~/lib/auth-client";
import { setLocalStorage, getLocalStorage } from "../constants/localStorage";

export const useLoginForm = () => {
  const router = useRouter();

  const form = useForm<LoginFormSchemaType>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: getLocalStorage<string>("remembered_email") || "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormSchemaType) => {
    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (error) {
        const browserLang = navigator.language.split("-")[0];
        const supportedLangs = ["en", "es", "id", "ru"];
        const selectedLang = supportedLangs.includes(browserLang)
          ? (browserLang as "en" | "es" | "id" | "ru")
          : "en";

        toast.error(
          error.code 
            ? getErrorMessage(error.code, selectedLang) 
            : error.message || "Login failed"
        );
        return;
      }

      setLocalStorage("remembered_email", data.email);
      toast.success("Login successful!");
      router.refresh();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  return { 
    form, 
    onSubmit,
    isSubmitting: form.formState.isSubmitting 
  };
};