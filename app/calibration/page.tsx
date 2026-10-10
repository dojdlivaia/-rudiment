"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import CalibrationCurve from "@/components/charts/CalibrationCurve";
import Raptor, { RaptorSpeech } from "@/components/mascot/Raptor";
import { readAttempts, type StoredAttempt } from "@/lib/demo-store";
import { calibrationCurve, brierScore, overallOverconfidence } from "@/lib/metrics";

/**
 * /calibration — экран кривой калибровки: Brier score, overconfidence, curve.
 * Демо-режим: flat-ответы (confidence + correct) берутся из GET /api/profile,
 * который агрегирует либо Supabase (attempts/answers), либо data/demo-attempts.json.
 */

interface FlatAnswer {
  confidence: number;
  correct: boolean;
}

interface ProfilePayload {
  calibration?: {
    points: Array<{ bin: number; observed: number | null; count: number }>;
    brier: number;
    overconfidence: number;
    answersCount: number;
  };
}

export default function CalibrationPage() {
  const [answers, setAnswers] = useState<FlatAnswer[]>([]);
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);

  useEffect(() => {
    async function load() {
      setAttempts(readAttempts());
      try {
        const res = await fetch("/api/profile");
        const json: ProfilePayload = await res.json();
        setProfile(json);
        // Точки калибровки уже посчитаны на сервере — восстанавливаем плоские ответы
        // для локальных метрик (bins -> confidence/correct с весами).
        const flat: FlatAnswer[] = [];
        for (const p of json.calibration?.points ?? []) {
          if (p.observed === null || p.count === 0) continue;
          const correctCount = Math.round(p.observed * p.count);
          for (let i = 0; i < p.count; i++) {
            flat.push({ confidence: p.bin, correct: i < correctCount });
          }
        }
        setAnswers(flat);
      } catch {
        // сеть недоступна: рисуем пустое состояние
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const points = profile?.calibration?.points ?? calibrationCurve(answers);
  const brier = answers.length ? brierScore(answers) : profile?.calibration?.brier ?? 0;
  const oc = answers.length ? overallOverconfidence(answers) : profile?.calibration?.overconfidence ?? 0;

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-3xl text-ink">Кривая калибровки</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          Не «насколько вы умный», а «насколько ваша уверенность совпадает с реальностью».
          Идеальный наблюдатель живёт на диагонали.
        </p>

        {/* Метрики */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Brier score" value={answers.length ? brier.toFixed(3) : "—"} hint="0 — идеал · 0.25 — уровень случайного угадывания" tone={brier <= 0.15 ? "moss" : brier <= 0.3 ? "amber" : "clay"} />
          <Stat
            label="Overconfidence"
            value={answers.length ? `${oc >= 0 ? "+" : ""}${Math.round(oc * 100)}%` : "—"}
            hint="средняя уверенность минус доля верных"
            tone={Math.abs(oc) <= 0.1 ? "moss" : oc > 0.2 ? "clay" : "amber"}
          />
          <Stat label="Ответов учтено" value={String(answers.length)} hint={`попыток: ${attempts.length}`} tone="ink" />
        </div>

        {/* График */}
        <div className="mt-8">
          {!loading && answers.length === 0 ? (
            <div className="card flex flex-col items-center gap-4 p-12 text-center">
              <Raptor mood="idle" size={140} />
              <div>
                <p className="font-display text-lg text-ink">Диагональ пока пустует</p>
                <p className="mt-1 text-sm text-ink-faint">Пройдите первый сценарий — точки калибровки вылупятся сами.</p>
              </div>
              <Link href="/tests/anchoring" className="btn-primary">Якорение · 4 минуты</Link>
            </div>
          ) : (
            <CalibrationCurve points={points} />
          )}
        </div>

        {/* Разговор с раптором */}
        {answers.length >= 5 && (
          <div className="mt-8">
            <RaptorSpeech mood={oc > 0.15 ? "facepaw" : "smug"}>
              {oc > 0.15
                ? "Заметил закономерность: когда ты уверен выше 70%, раптор берёт верх чаще, чем ты думаешь. Попробуй в следующем сценарии честно ставить 50% — и посмотри, как изменится кривая."
                : "Отличная работа: уверенность идёт ноздря в ноздрю с точностью. Это реже, чем хорошая память и почти так же полезно."}
            </RaptorSpeech>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: "moss" | "amber" | "clay" | "ink" }) {
  const colors = { moss: "text-moss", amber: "text-amber", clay: "text-clay-dark", ink: "text-ink" };
  return (
    <div className="card p-5">
      <p className={`font-mono text-3xl tabular-nums ${colors[tone]}`}>{value}</p>
      <p className="mt-1 text-sm font-medium text-ink">{label}</p>
      <p className="mt-1 text-xs leading-snug text-ink-faint">{hint}</p>
    </div>
  );
}
