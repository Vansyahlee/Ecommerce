"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const session = authClient.useSession();
  const user = session.data?.user as { role?: string; name?: string; email?: string } | undefined;

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-cyan-600">
              <ShieldCheck className="h-8 w-8" />
              <span className="hidden sm:block">VanszStore</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"> Dashboard </Link>
              {user?.role === "SUPER_ADMIN" && (
                <Link href="/dashboard/root" className="rounded-md px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"> Admin Panel </Link>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 gap-4">
              {session.data ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                    <span className="text-[10px] font-medium text-cyan-600 bg-cyan-50 px-2 rounded-full capitalize"> {user?.role?.toLowerCase()} </span>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full border border-slate-200" onClick={handleSignOut}>
                    <LogOut className="h-5 w-5 text-slate-600" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" asChild> <Link href="/login">Login</Link> </Button>
                  <Button className="bg-cyan-600 hover:bg-cyan-700" asChild> <Link href="/register">Sign Up</Link> </Button>
                </div>
              )}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-100">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            <Link href="/dashboard" className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"> Dashboard </Link>
            {user?.role === "SUPER_ADMIN" && (
              <Link href="/dashboard/root" className="block rounded-md px-3 py-2 text-base font-medium text-rose-600 hover:bg-rose-50"> Admin Panel </Link>
            )}
            <hr className="my-2" />
            <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100">
              <LogOut className="h-5 w-5" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;