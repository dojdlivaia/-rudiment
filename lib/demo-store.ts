"use client";

/**
 * Демо-хранилище попыток (localStorage), если Supabase не настроен.
 * Тот же формат данных, что возвращает /api/attempts — UI не различает режимы.
 */

export interface StoredAnswer {
  questionId: string;
  value: string;
  confidence: number;
  responseMs: number;
}

export interface StoredAttempt {
  id: string;
  slug: string;
  bias: string;
  answers: StoredAnswer[];
  susceptibility: number;
  meanBrier: number;
  overconfidence: number;
  createdAt: string;
}

const KEY = "rudiment.attempts.v1";

export function readAttempts(): StoredAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveAttempt(a: Omit<StoredAttempt, "id" | "createdAt">): StoredAttempt {
  const attempt: StoredAttempt = {
    ...a,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const all = readAttempts();
  all.push(attempt);
  localStorage.setItem(KEY, JSON.stringify(all));
  return attempt;
}

export function clearAttempts() {
  localStorage.removeItem(KEY);
}
