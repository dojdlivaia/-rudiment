import { z } from "zod";
import type { ScenarioQuestion, BiasId } from "./scenario-schema";

/**
 * Метрики сценария и калибровки. Чистые функции — легко тестировать,
 * одни и те же на клиенте (мгновенный фидбек) и на сервере (/api/attempts).
 */

export const answerSchema = z.object({
  questionId: z.string(),
  /** Для choice — id опции; для estimate — число как строка */
  value: z.string(),
  /** Уверенность в ответе, 0..1 (слайдер после ответа) */
  confidence: z.number().min(0).max(1),
  /** Время до ответа, мс */
  responseMs: z.number().int().nonnegative().default(0),
});
export type AnswerInput = z.infer<typeof answerSchema>;

export interface QuestionResult {
  questionId: string;
  biasScore: number; // 0..1, сколько в ответе «раптора»
  correct: boolean; // для estimate: попал близко к истине; для choice: biasScore === 0
  brier: number; // (confidence - correct)^2
}

export interface ScenarioResult {
  perQuestion: QuestionResult[];
  /** Подверженность искажению: 0..1 (средний biasScore) */
  susceptibility: number;
  /** Средний Brier по вопросам этого сценария: 0 (идеал) .. 1 (худший) */
  meanBrier: number;
  /** Уверенность минус точность: >0 — overconfidence, <0 — недооценка себя */
  overconfidence: number;
}

const ESTIMATE_TOLERANCE = 0.25; // ±25% от истины считаем «попаданием»

export function scoreAnswer(q: ScenarioQuestion, a: AnswerInput): QuestionResult {
  let biasScore = 0.5;
  let correct = false;

  if (q.kind === "estimate" && q.estimate) {
    const val = Number(a.value);
    const { truth } = q.estimate;
    const relError = Math.abs(val - truth) / Math.max(Math.abs(truth), 1);
    correct = relError <= ESTIMATE_TOLERANCE;
    // Смещение к якорю — главный грех; плюс штраф за промах
    const anchor = q.estimate.anchor ?? truth;
    const pullToAnchor =
      anchor !== truth
        ? Math.max(0, 1 - Math.abs(val - anchor) / Math.abs(anchor - truth))
        : 0;
    biasScore = clamp01(0.6 * pullToAnchor + (correct ? 0 : 0.4));
  } else {
    const opt = q.options.find((o) => o.id === a.value);
    biasScore = opt?.biasScore ?? 0.5;
    correct = biasScore <= 0.25;
  }

  return {
    questionId: q.id,
    biasScore,
    correct,
    brier: Math.pow(a.confidence - (correct ? 1 : 0), 2),
  };
}

export function scoreScenario(
  questions: ScenarioQuestion[],
  answers: AnswerInput[],
): ScenarioResult {
  const byId = new Map(answers.map((a) => [a.questionId, a]));
  const perQuestion = questions
    .map((q) => byId.get(q.id))
    .filter((a): a is AnswerInput => Boolean(a))
    .map((a) => {
      const q = questions.find((qq) => qq.id === a.questionId)!;
      return scoreAnswer(q, a);
    });

  const n = Math.max(perQuestion.length, 1);
  const susceptibility = perQuestion.reduce((s, r) => s + r.biasScore, 0) / n;
  const meanBrier = perQuestion.reduce((s, r) => s + r.brier, 0) / n;
  const meanConf =
    answers.reduce((s, a) => s + a.confidence, 0) / n;
  const accuracy = perQuestion.reduce((s, r) => s + (r.correct ? 1 : 0), 0) / n;

  return {
    perQuestion,
    susceptibility: clamp01(susceptibility),
    meanBrier,
    overconfidence: meanConf - accuracy,
  };
}

/* ---------- Калибровка (агрегат по всем ответам пользователя) ---------- */

export interface CalibrationPoint {
  bin: number; // центр бинов 0.0..1.0 с шагом 0.1
  observed: number | null; // фактическая доля верных (null — нет данных)
  count: number;
}

export function calibrationCurve(
  answers: Array<{ confidence: number; correct: boolean }>,
): CalibrationPoint[] {
  const points: CalibrationPoint[] = [];
  for (let i = 0; i < 10; i++) {
    const lo = i / 10;
    const hi = (i + 1) / 10;
    const inBin = answers.filter((a) => a.confidence >= lo && a.confidence < hi + (i === 9 ? 0.0001 : 0));
    points.push({
      bin: (lo + hi) / 2,
      count: inBin.length,
      observed: inBin.length
        ? inBin.reduce((s, a) => s + (a.correct ? 1 : 0), 0) / inBin.length
        : null,
    });
  }
  return points;
}

export function brierScore(
  answers: Array<{ confidence: number; correct: boolean }>,
): number {
  if (!answers.length) return 0;
  return (
    answers.reduce((s, a) => s + Math.pow(a.confidence - (a.correct ? 1 : 0), 2), 0) /
    answers.length
  );
}

export function overallOverconfidence(
  answers: Array<{ confidence: number; correct: boolean }>,
): number {
  if (!answers.length) return 0;
  const conf = answers.reduce((s, a) => s + a.confidence, 0) / answers.length;
  const acc = answers.reduce((s, a) => s + (a.correct ? 1 : 0), 0) / answers.length;
  return conf - acc;
}

export function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** Название искажения для UI/радара */
export const BIAS_LABELS: Record<BiasId, string> = {
  anchoring: "Якорение",
  "sunk-cost": "Невозвратные затраты",
  "confirmation-bias": "Предвзятость подтверждения",
  "base-rate": "Игнор базовой ставки",
  "monty-hall": "Парадокс Монти Холла",
  hindsight: "Ошибка ретроспектива",
};
