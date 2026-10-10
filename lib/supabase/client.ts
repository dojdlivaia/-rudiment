"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Браузерный анонимный клиент Supabase (null, если env не заданы — демо-режим). */
export function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}
