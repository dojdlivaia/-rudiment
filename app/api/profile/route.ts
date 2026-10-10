import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getServerSupabase, supabaseEnabled } from "@/lib/supabase/server";
import { BIAS_LABELS, calibrationCurve, brierScore, type BiasIdLocal } from "@/lib/profile-aggregate";

/**
 * GET /api/profile — агрегированный профиль: радар подверженностей + калибровка.
 * Supabase: SELECT из attempts/answers (RLS фильтрует «только свои»).
 * Демо-режим: читает data/demo-attempts.json.
 */

export async function GET(req: NextRequest) {
  const sb = getServerSupabase();

  if (sb && supabaseEnabled) {
    const {
      data: { user },
    } = await sb.auth.getUser(req.headers.get("authorization")?.replace("Bearer ", "") ?? undefined);

    if (user) {
      const [{ data: attempts }, { data: answers }] = await Promise.all([
        sb.from("attempts").select("bias, susceptibility, mean_brier, overconfidence, finished_at").eq("user_id", user.id),
        sb.from("answers").select("confidence, correct").eq("user_id", user.id),
      ]);

      return NextResponse.json(buildProfile(attempts ?? [], answers ?? []));
    }
  }

  // Демо-режим
  let records: any[] = [];
  try {
    records = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "data", "demo-attempts.json"), "utf-8"),
    );
  } catch {
    records = [];
  }
  const attempts = records.map((r) => ({
    bias: r.bias,
    susceptibility: r.susceptibility,
    mean_brier: r.meanBrier,
    overconfidence: r.overconfidence,
    finished_at: r.createdAt,
  }));
  const answers = records.flatMap((r) =>
    (r.perQuestion ?? []).map((q: any, i: number) => ({
      confidence: r.answers?.[i]?.confidence ?? 0.5,
      correct: q.correct,
    })),
  );
  return NextResponse.json(buildProfile(attempts, answers));
}

function buildProfile(
  attempts: Array<{ bias: string; susceptibility: number; mean_brier: number; overconfidence: number }>,
  answers: Array<{ confidence: number; correct: boolean }>,
) {
  // Радар: средняя подверженность по каждому искажению
  const byBias = new Map<string, number[]>();
  for (const a of attempts) {
    byBias.set(a.bias, [...(byBias.get(a.bias) ?? []), Number(a.susceptibility)]);
  }
  const radar = Object.entries(BIAS_LABELS).map(([bias, label]) => {
    const vals = byBias.get(bias as BiasIdLocal) ?? [];
    return {
      bias,
      label,
      susceptibility: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null,
      attempts: vals.length,
    };
  });

  const allAnswers = answers.map((a) => ({
    confidence: Number(a.confidence),
    correct: Boolean(a.correct),
  }));

  const strengths = radar
    .filter((r) => r.susceptibility !== null && r.susceptibility <= 0.35)
    .sort((a, b) => (a.susceptibility ?? 1) - (b.susceptibility ?? 1))
    .map((r) => r.label);

  return {
    radar,
    strengths,
    calibration: {
      points: calibrationCurve(allAnswers),
      brier: brierScore(allAnswers),
      overconfidence: allAnswers.length
        ? allAnswers.reduce((s, a) => s + a.confidence, 0) / allAnswers.length -
          allAnswers.reduce((s, a) => s + (a.correct ? 1 : 0), 0) / allAnswers.length
        : 0,
      answersCount: allAnswers.length,
    },
    mode: supabaseEnabled ? "supabase" : "demo",
  };
}
