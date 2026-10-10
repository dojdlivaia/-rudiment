"use client";

import Link from "next/link";

/** Шапка приложения (для /dashboard, /tests, /calibration). */
export default function AppNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand-100 bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <span aria-hidden className="inline-block h-3 w-3 rounded-full bg-clay" />
          Рудимент
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-soft">
          <Link href="/dashboard" className="transition-colors duration-150 ease-rudiment hover:text-clay-dark">Сценарии</Link>
          <Link href="/calibration" className="transition-colors duration-150 ease-rudiment hover:text-clay-dark">Калибровка</Link>
          <Link href="/profile" className="transition-colors duration-150 ease-rudiment hover:text-clay-dark">Профиль</Link>
        </nav>
      </div>
    </header>
  );
}
