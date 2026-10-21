import { getProducts, getTransactions, getUsers, toggleBlockUser } from "~/features/auth/hooks/useAdminActions";
import { Zap, Globe } from "lucide-react";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const users = await getUsers();
  const products = await getProducts();
  const transactions = await getTransactions();

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans text-slate-900 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest">
            <Zap size={12} className="fill-current" />
            Super Admin Authority
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
            ROOT<span className="text-rose-600">.</span>CONTROL
          </h1>
          <p className="text-slate-500 font-medium tracking-tight flex items-center gap-2 opacity-80 mt-2">
            <Globe size={14} /> Monitoring deployed application & store ecosystems
          </p>
        </div>
      </div>

      <AdminDashboardClient
        users={users}
        products={products}
        transactions={transactions}
        toggleBlockUser={toggleBlockUser}
      />
    </div>
  );
}