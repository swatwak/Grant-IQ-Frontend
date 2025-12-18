"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

const navItems = [
  {
    label: "Application Validation",
    href: "/dashboard/application-validation",
  },
  {
    label: "Scrutiny",
    href: "/dashboard/scrutiny",
    disabled: true,
  },
  {
    label: "Recommendation",
    href: "/dashboard/recommendation",
    disabled: true,
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    window.localStorage.removeItem("grantiq_token");
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3b0764] via-[#6d28d9] to-[#020617] flex flex-col">
      <header className="h-16 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-[#fb7185] to-[#f97316] flex items-center justify-center shadow-lg shadow-pink-500/40">
            <span className="text-sm font-semibold text-white">IQ</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">GrantIQ</p>
            <p className="text-[11px] text-pink-200/80">
              Smart Scholarship Management Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-violet-100/90">Signed in as</span>
            <span className="text-sm font-medium text-white">Grantor</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-pink-200 hover:text-white border border-pink-400/70 rounded-full px-3 py-1 bg-pink-500/10"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-slate-950/50 border-r border-white/10 backdrop-blur-xl hidden md:flex flex-col">
          <div className="px-5 pt-6 pb-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-4">
              Grantor Console
            </p>
            <h2 className="text-lg font-semibold text-white">
              Application Workflow
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Track and manage scholarship applications across all stages.
            </p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <button
                  key={item.label}
                  disabled={item.disabled}
                  onClick={() => {
                    if (!item.disabled) router.push(item.href);
                  }}
                  className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-3 text-sm transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500/90 to-orange-400/90 text-white shadow-lg shadow-pink-500/40"
                      : "text-slate-200 hover:bg-slate-900/70"
                  } ${item.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] uppercase tracking-wide">
                    {item.disabled ? "Coming soon" : "Active"}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-white/10 text-xs text-slate-300">
            <p className="font-medium text-slate-100 mb-1">
              Workflow Summary
            </p>
            <p>
              Start with <span className="font-semibold">Application Validation</span>, then
              move candidates through <span className="font-semibold">Scrutiny</span> and{" "}
              <span className="font-semibold">Recommendation</span>.
            </p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

