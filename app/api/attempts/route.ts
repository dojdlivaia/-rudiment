import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabase, supabaseEnabled } from "@/lib/supabase/server";
import { scoreScenario, answerSchema, type AnswerInput } from "@/lib/metrics";
import { loadScenario } from "@/lib/scenario-engine";

/**
 * POST /api/attempts — сохранить попытку сценария.
 * Тело: { slug, answers: [{questionId, value, confidence, responseMs}] }
 * Сервер пересчитывает метрики по Zod-схеме сценария (клиенту не доверяем).
 * Без Supabase — пишет в data/demo-attempts.json (демо-режим MVP).
 */

/** Типизация вставок без сгенерированных типов базы (sb.from(...) generic = never без Database) */
type AttemptInsert = Record<string, unknown>;
type AnswerInsert = Record<string, unknown>;

const bodySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** Демо-флаг: повторная отправка сохранённой попытки ради пересчёта, без записи */
  rescoreOnly: z.boolean().default(false),
  answers: z.array(answerSchema).min(1),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }

  let scenario;
  try {
    scenario = loadScenario(parsed.slug);
  } catch {
    return NextResponse.json({ error: "Сценарий не найден" }, { status: 404 });
  }

  const result = scoreScenario(scenario.questions, parsed.answers as AnswerInput[]);

  // Попытка достать пользователя (если включена auth-сессия)
  const sb = getServerSupabase();
  if (sb && supabaseEnabled) {
    const {
      data: { user },
    } = await sb.auth.getUser(req.headers.get("authorization")?.replace("Bearer ", "") ?? undefined);

    if (user) {
      // Типизация через unknown: без сгенерированных типов Database insert-объекты
      // выводятся как never[] — приводим таблицы к «свободному» клиенту.
      const attemptsTable = sb.from("attempts") as unknown as {
        insert: (values: AttemptInsert | AttemptInsert[]) => {
          select: (cols: string) => { single: () => Promise<{ data: { id: string } | null; error: unknown }> };
        };
      };
      const answersTable = sb.from("answers") as unknown as {
        insert: (values: AnswerInsert | AnswerInsert[]) => Promise<{ data: unknown; error: unknown }>;
      };

      const { data: attempt, error } = await attemptsTable
        .insert({
          user_id: user.id,
          scenario_slug: scenario.slug,
          bias: scenario.bias,
          susceptibility: result.susceptibility,
          mean_brier: result.meanBrier,
          overconfidence: result.overconfidence,
          finished_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (!error && attempt) {
        await answersTable.insert(
          result.perQuestion.map((r) => {
            const a = parsed.answers.find((x) => x.questionId === r.questionId)!;
            return {
              attempt_id: attempt.id,
              user_id: user.id,
              question_id: r.questionId,
              value: a.value,
              confidence: a.confidence,
              correct: r.correct,
              brier: r.brier,
              response_ms: a.responseMs,
            };
          }),
        );
        return NextResponse.json({ id: attempt.id, mode: "supabase", result });
      }
    }
  }

  // Демо-режим: файл рядом с проектом (только для разработки без Supabase)
  const demoFile = path.join(process.cwd(), "data", "demo-attempts.json");
  let all: unknown[] = [];
  try {
    all = JSON.parse(fs.readFileSync(demoFile, "utf-8"));
  } catch {
    all = [];
  }
  const record = {
    id: crypto.randomUUID(),
    slug: scenario.slug,
    bias: scenario.bias,
    answers: parsed.answers,
    ...result,
    createdAt: new Date().toISOString(),
  };
  all.push(record);
  fs.mkdirSync(path.dirname(demoFile), { recursive: true });
  fs.writeFileSync(demoFile, JSON.stringify(all, null, 2));

  return NextResponse.json({ id: record.id, mode: "demo", result });
}
