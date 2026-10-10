"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { fadeUp, transition } from "@/lib/motion";
import type { ScenarioQuestion } from "@/lib/scenario-schema";
import type { AnswerInput } from "@/lib/metrics";
import { RaptorSpeech, type RaptorMood } from "@/components/mascot/Raptor";

/**
 * Движок прохождения сценария: вопрос → ответ → слайдер уверенности → реплика раптора.
 * Раптор реагирует на biasScore опции: совестливый ответ — smug, явный якорь — facepaw.
 */

interface Props {
  questions: ScenarioQuestion[];
  /** Родитель получает финальные ответы и вызывает /api/attempts */
  onComplete: (answers: AnswerInput[]) => void;
}

export default function ScenarioRunner({ questions, onComplete }: Props) {
  const [step, setStep] = useState(0); // индекс текущего вопроса
  const [phase, setPhase] = useState<"answer" | "confidence">("answer");
  const [picked, setPicked] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(50);
  const [t0, setT0] = useState(Date.now());
  const [answers, setAnswers] = useState<AnswerInput[]>([]);

  const q = questions[step];
  const isLast = step === questions.length - 1;

  function currentBiasScore(): number {
    if (!q) return 0.5;
    if (q.kind === "estimate") {
      if (estimate === null || !q.estimate) return 0.5;
      const truth = q.estimate.truth;
      const rel = Math.abs(estimate - truth) / Math.max(Math.abs(truth), 1);
      return Math.min(1, rel * 2);
    }
    return q.options.find((o) => o.id === picked)?.biasScore ?? 0.5;
  }

  const mood: RaptorMood = currentBiasScore() <= 0.25 ? "smug" : currentBiasScore() >= 0.7 ? "facepaw" : "alert";
  const raptorLine = q?.options.find((o) => o.id === picked)?.raptorLine;

  function submitAnswer(value: string) {
    setPicked(value);
    setPhase("confidence");
  }

  function next() {
    const value = q.kind === "estimate" ? String(estimate ?? q.estimate?.min ?? 0) : picked!;
    const record: AnswerInput = {
      questionId: q.id,
      value,
      confidence: confidence / 100,
      responseMs: Date.now() - t0,
    };
    const merged = [...answers.filter((a) => a.questionId !== q.id), record];
    setAnswers(merged);

    if (isLast) {
      onComplete(merged);
      return;
    }
    setStep(step + 1);
    setPhase("answer");
    setPicked(null);
    setEstimate(null);
    setConfidence(50);
    setT0(Date.now());
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Прогресс */}
      <div className="mb-8 flex items-center gap-2" aria-label={`Вопрос ${step + 1} из ${questions.length}`}>
        {questions.map((_, i) => (
          <motion.span
            key={i}
            className="h-1.5 flex-1 rounded-pill bg-sand-100"
            animate={{ backgroundColor: i <= step ? "#D97742" : "#EDE5D6" }}
            transition={transition.base}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${step}-${phase}`} variants={fadeUp} initial="initial" animate="animate" exit="exit">
          {phase === "answer" && (
            <>
              <h3 className="mb-6 font-display text-xl leading-snug text-ink">{q.prompt}</h3>

              {q.kind === "estimate" && q.estimate ? (
                <EstimateControl
                  min={q.estimate.min}
                  max={q.estimate.max}
                  step={q.estimate.step}
                  unit={q.estimate.unit}
                  value={estimate ?? Math.round((q.estimate.min + q.estimate.max) / 2)}
                  onChange={(v) => {
                    setEstimate(v);
                  }}
                  onCommit={() => estimate !== null && submitAnswer(String(estimate))}
                />
              ) : (
                <div className="space-y-3">
                  {q.options.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => submitAnswer(o.id)}
                      className="block w-full rounded-card border border-sand-200 bg-surface px-5 py-4 text-left text-[15px] leading-relaxed text-ink-soft shadow-soft transition-all duration-250 ease-rudiment hover:border-clay/50 hover:text-ink hover:shadow-lift active:scale-[0.99]"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {phase === "confidence" && (
            <div className="card p-6">
              {raptorLine && (
                <div className="mb-6">
                  <RaptorSpeech mood={mood}>{raptorLine}</RaptorSpeech>
                </div>
              )}
              <p className="mb-1 text-sm font-medium text-ink">Насколько вы уверены в ответе?</p>
              <p className="mb-5 text-xs text-ink-faint">
                Честно: калибровка измеряет не правильность, а соответствие уверенности реальности.
              </p>
              <div className="flex items-center gap-5">
                <input
                  type="range"
                  min={5}
                  max={95}
                  step={5}
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="confidence-range"
                  aria-label="Уверенность"
                />
                <span className="w-16 shrink-0 text-right font-mono text-lg tabular-nums text-clay-dark">
                  {confidence}%
                </span>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={next} className="btn-primary">
                  {isLast ? "Показать разбор" : "Дальше"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EstimateControl({
  min, max, step, unit, value, onChange, onCommit,
}: {
  min: number; max: number; step: number; unit: string;
  value: number; onChange: (v: number) => void; onCommit: () => void;
}) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-sm text-ink-faint">Ваша оценка</span>
        <span className="font-mono text-3xl tabular-nums text-ink">
          {value.toLocaleString("ru-RU")}
          <span className="ml-1 text-lg text-clay">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="confidence-range"
        aria-label="Оценка"
      />
      <div className="mt-2 flex justify-between font-mono text-xs text-ink-faint">
        <span>{min.toLocaleString("ru-RU")} {unit}</span>
        <span>{max.toLocaleString("ru-RU")} {unit}</span>
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={onCommit} className="btn-primary">Зафиксировать оценку</button>
      </div>
    </div>
  );
}
