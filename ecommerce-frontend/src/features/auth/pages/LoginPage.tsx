"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/forms";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useLoginForm } from "../hooks/useLoginForm";
import { authClient } from "~/lib/auth-client";

const LoginPage = () => {
  const router = useRouter();
  const { form, onSubmit } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);
  const session = authClient.useSession();

  useEffect(() => {
    if (session.data?.user) {
      const user = session.data.user as { role?: string };
      const routes = {
        SUPER_ADMIN: "/dashboard/root",
        ADMIN: "/dashboard/admin",
        USER: "/dashboard/user",
      };
      router.replace(routes[user.role as keyof typeof routes] || "/dashboard/user");
    }
  }, [session.data, router]);

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  if (session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center w-full bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (session.data) return null;

  return (
    <div className="flex min-h-screen items-center justify-center w-full bg-slate-50 p-4 font-sans">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white overflow-hidden">
        <CardHeader className="space-y-2 text-center pt-8">
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Sign In</CardTitle>
          <CardDescription className="text-slate-500">Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-6 px-8">
          <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-3 font-semibold border-slate-200 hover:bg-slate-50 transition-all" onClick={handleGoogleLogin} type="button">
            <FcGoogle className="h-5 w-5" /> Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center px-1"><Separator className="w-full" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-medium">Or continue with email</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-sm">Email</FormLabel>
                  <FormControl><Input placeholder="name@example.com" className="h-12 border-slate-200 focus-visible:ring-cyan-500 bg-white" {...field} /></FormControl>
                  <FormMessage className="text-xs font-medium text-rose-600 animate-in fade-in slide-in-from-top-1" />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-sm">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="" className="h-12 border-slate-200 focus-visible:ring-cyan-500 bg-white pr-10" {...field} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-rose-600 animate-in fade-in slide-in-from-top-1" />
                </FormItem>
              )} />

              <Button type="submit" className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg shadow-lg shadow-cyan-100 transition-all active:scale-[0.98] mt-2">Sign In</Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center pb-10 pt-2 bg-white border-none">
          <p className="text-sm text-slate-600 font-medium">
            Don&apos;t have an account? <Link href="/register" className="text-cyan-600 hover:underline font-bold transition-colors">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;