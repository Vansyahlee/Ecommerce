"use client";

import { useState } from "react";
import { useLoginForm } from "../hooks/useLoginForm";
import { LoginFormSchemaType } from "../forms/login";

export const LoginForm = () => {
  const { form, onSubmit } = useLoginForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: LoginFormSchemaType) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Sign In</h2>
        <p className="mt-2 text-sm text-gray-600">Enter your credentials to continue</p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-8 space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email Address</label>
          <input
            {...form.register("email")}
            type="email"
            disabled={isSubmitting}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            {...form.register("password")}
            type="password"
            disabled={isSubmitting}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-70 flex justify-center items-center transition-all"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
};