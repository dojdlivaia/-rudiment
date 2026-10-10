import { z } from "zod";

/**
 * Zod-схема фронтматтера MDX-сценария.
 * Каждый файл content/tests/<slug>.mdx обязан ей соответствовать —
 * кривой сценарий не попадёт в продакшен, а упадёт на этапе сборки/загрузки.
 */

export const biasIdSchema = z.enum([
  "anchoring",
  "sunk-cost",
  "confirmation-bias",
  "base-rate",
  "monty-hall",
  "hindsight",
]);
export type BiasId = z.infer<typeof biasIdSchema>;

const optionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  /** Итоговый «вес» ответа для метрики подверженности: 0 = совестливый ответ, 1 = раптор победил */
  biasScore: z.number().min(0).max(1).default(0.5),
  /** Короткая реплика раптора сразу после выбора (до разбора) */
  raptorLine: z.string().optional(),
});

const questionSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["choice", "estimate"]).default("choice"),
  prompt: z.string().min(1),
  options: z.array(optionSchema).min(2),
  /** Для kind=estimate: диапазон ползунка и эталон */
  estimate: z
    .object({
      min: z.number(),
      max: z.number(),
      step: z.number().default(1),
      unit: z.string().default(""),
      truth: z.number(), // объективный ответ
      anchor: z.number().optional(), // «виновник» смещения
    })
    .optional(),
});

export const scenarioFrontmatterSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  bias: biasIdSchema,
  /** Эволюционный «паспорт» искажения — показываем в разборе */
  origin: z.string().min(1), // когда пригодилось предкам
  modernCost: z.string().min(1), // чем мешает сейчас
  order: z.number().int().positive(),
  durationSec: z.number().int().positive().default(180),
  questions: z.array(questionSchema).min(1),
  /** Тон разбора: тёплый, ироничный, без морализаторства */
  debriefTitle: z.string().default("Что только что произошло"),
  tags: z.array(z.string()).default([]),
});
export type ScenarioFrontmatter = z.infer<typeof scenarioFrontmatterSchema>;
export type ScenarioQuestion = z.infer<typeof questionSchema>;
export type ScenarioOption = z.infer<typeof optionSchema>;

/** Полный сценарий = фронтматтер + MDX-тело */
export interface Scenario extends ScenarioFrontmatter {
  body: string;
}
