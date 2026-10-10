import { createClient as createServerClient } from "@supabase/supabase-js";

/**
 * Клиенты Supabase. Приложение работает и без Supabase (демо-режим с localStorage):
 * если env-переменные не заданы, getServerSupabase вернёт null, а API сохранит
 * попытку в data/demo-attempts.json — так MVP можно показать без бэкенда.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseEnabled = Boolean(url && anonKey);

let _server: ReturnType<typeof createServerClient> | null = null;

/** Серверный клиент (service role) — только для /api-роутов. Не попадает в браузер. */
export function getServerSupabase() {
  if (!url || !serviceKey) return null;
  if (!_server) {
    _server = createServerClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return _server;
}

/** URL анонимного клиента для браузера (lib/supabase/client.ts). */
export function getPublicConfig() {
  return { url: url ?? "", anonKey: anonKey ?? "" };
}
