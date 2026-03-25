'use client';

import Image from 'next/image';
import React, { useState, type ReactNode } from 'react';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950/20">
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 border-r border-slate-800 bg-slate-950/95 px-3 py-4 shadow-2xl shadow-slate-950/50 transition-all duration-300 lg:static lg:translate-x-0 lg:bg-slate-950/90',
          sidebarCollapsed ? 'w-[4.75rem]' : 'w-[16rem]',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="overflow-hidden border border-cyan-400/30 bg-slate-900/80 p-2">
                <Image src="/icon.png" alt="SirTaskalot icon" width={36} height={36} priority />
              </div>
              {!sidebarCollapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-xs uppercase tracking-[0.35em] text-cyan-300">SirTaskalot</p>
                  <p className="mt-1 truncate text-xs text-slate-400">Calendar-first routines</p>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="hidden border border-slate-700 px-2 py-1 text-xs text-slate-300 lg:inline-flex"
                onClick={() => setSidebarCollapsed((current) => !current)}
              >
                {sidebarCollapsed ? '→' : '←'}
              </button>
              <button
                type="button"
                className="border border-slate-700 px-2 py-1 text-xs text-slate-300 lg:hidden"
                onClick={() => setMenuOpen(false)}
              >
                Close
              </button>
            </div>
          </div>

          {!sidebarCollapsed ? (
            <>
              <div className="border border-slate-800 bg-slate-950/70 p-3">
                <h1 className="text-lg font-semibold text-white">A calendar for every task that matters.</h1>
                <p className="mt-2 text-xs text-slate-300">
                  Built mobile-first for quick check-offs, flexible completion forms, OAuth accounts, Redis caching,
                  and observability-friendly automation.
                </p>
              </div>

              <div className="border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
                <p className="font-semibold text-white">Sign in options</p>
                <ul className="mt-2 space-y-1 pl-4 text-slate-400">
                  <li>Google OAuth</li>
                  <li>GitHub OAuth</li>
                  <li>Local account via NextAuth adapter-ready stack</li>
                </ul>
              </div>

              <div className="mt-auto border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
                <p className="font-semibold text-white">Today’s focus</p>
                <p className="mt-2">Untimed tasks stay pinned at the top. Scheduled tasks span the correct hours below.</p>
              </div>
            </>
          ) : (
            <div className="mt-2 flex flex-1 flex-col gap-2">
              <div className="border border-slate-800 bg-slate-950/70 p-2 text-center text-[10px] text-slate-400">Cal</div>
              <div className="border border-slate-800 bg-slate-950/60 p-2 text-center text-[10px] text-slate-400">Auth</div>
              <div className="border border-slate-800 bg-slate-950/60 p-2 text-center text-[10px] text-slate-400">Focus</div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-20 border-b border-slate-800/80 bg-slate-950/85 px-3 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="overflow-hidden border border-cyan-400/30 bg-slate-900/80 p-1.5">
                <Image src="/icon.png" alt="SirTaskalot icon" width={28} height={28} priority />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">SirTaskalot</p>
                <p className="text-xs text-slate-400">Calendar</p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="inline-flex items-center gap-2 border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200"
              onClick={() => setMenuOpen(true)}
            >
              <span className="text-base leading-none">☰</span>
              Menu
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden px-2 py-2 md:px-3 md:py-3">{children}</main>
      </div>
    </div>
  );
}
