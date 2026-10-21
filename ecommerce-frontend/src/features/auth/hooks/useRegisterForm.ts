import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RegisterFormSchema, RegisterFormSchemaType } from "../forms/register";
import { authClient } from "~/lib/auth-client";

export const useRegisterForm = () => {
  const router = useRouter();
  const form = useForm<RegisterFormSchemaType>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormSchemaType) => {
    try {
      const { error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
      });

      if (error) {
        toast.error(error.message || "Registration failed");
        return;
      }

      await authClient.signOut();

      toast.success("Account created! Redirecting to login...");
      
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1500);

    } catch {
      toast.error("An unexpected error occurred");
    }
  };

  return { form, onSubmit, isSubmitting: form.formState.isSubmitting };
};