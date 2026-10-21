"use client"

import React, { useState } from "react"
import Link from "next/link"
import { FcGoogle } from "react-icons/fc"
import { Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/forms"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { useRegisterForm } from "../hooks/useRegisterForm"
import { authClient } from "~/lib/auth-client"

const RegisterPage = () => {
  const { form, onSubmit } = useRegisterForm()
  const [showPassword, setShowPassword] = useState(false)

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard"
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center w-full bg-slate-50 p-4 font-sans">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white overflow-hidden">
        <CardHeader className="space-y-2 text-center pt-8">
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Create Account</CardTitle>
          <CardDescription className="text-slate-500">Sign up to get started with your account</CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-6 px-8">
          <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-3 font-semibold border-slate-200 hover:bg-slate-50 transition-all" onClick={handleGoogleLogin} type="button">
            <FcGoogle className="h-5 w-5" /> Sign up with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center px-1"><Separator className="w-full" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-medium">Or register with email</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold text-sm">First Name</FormLabel>
                    <FormControl><Input placeholder="" className="h-12 border-slate-200 focus-visible:ring-cyan-500 bg-white" {...field} /></FormControl>
                    <FormMessage className="text-[10px] font-medium text-rose-600" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold text-sm">Last Name</FormLabel>
                    <FormControl><Input placeholder="" className="h-12 border-slate-200 focus-visible:ring-cyan-500 bg-white" {...field} /></FormControl>
                    <FormMessage className="text-[10px] font-medium text-rose-600" />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-sm">Email</FormLabel>
                  <FormControl><Input placeholder="name@example.com" className="h-12 border-slate-200 focus-visible:ring-cyan-500 bg-white" {...field} /></FormControl>
                  <FormMessage className="text-xs font-medium text-rose-600" />
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
                  <FormMessage className="text-xs font-medium text-rose-600" />
                </FormItem>
              )} />

              <Button type="submit" className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg shadow-lg shadow-cyan-100 transition-all active:scale-[0.98] mt-2" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating Account..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center pb-10 pt-2 bg-white border-none">
          <p className="text-sm text-slate-600 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-600 hover:underline font-bold transition-colors">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default RegisterPage