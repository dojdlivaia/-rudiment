"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import AppNav from "@/components/AppNav";
import ScenarioRunner from "@/components/ScenarioRunner";
import Debrief from "@/components/Debrief";
import Raptor from "@/components/mascot/Raptor";
import { fadeUp } from "@/lib/motion";
import type { ScenarioFrontmatter, Scenario } from "@/lib/scenario-schema";
import { scoreScenario, type AnswerInput, type ScenarioResult } from "@/lib/metrics";

type Stage = "intro" | "run" | "saving" | "debrief";

/** Клиентская оболочка сценария: интро (MDX) → раннер → сохранение → разбор. */
export default function ScenarioClient({
  scenario,
  mdxSource,
}: {
  scenario: Omit<Scenario, "body">;
  mdxSource: MDXRemoteSerializeResult;
}) {
  const [stage, setStage] = useState<Stage>("intro");
  const [result, setResult] = useState<ScenarioResult | null>(null);

  async function handleComplete(answers: AnswerInput[]) {
    setStage("saving");
    const local = scoreScenario(scenario.questions, answers);
    try {
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: scenario.slug, answers }),
      });
    } catch {
      // сеть недоступна — показываем локальный разбор, данные не теряются в демо-режиме
    }
    setResult(local);
    setStage("debrief");
  }

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <AnimatePresence mode="wait">
          {stage === "intro" && (
            <motion.div key="intro" variants={fadeUp} initial="initial" animate="animate" exit="exit" className="mx-auto max-w-2xl">
              <span className="badge bg-clay-wash text-clay-dark">Сценарий · {scenario.title}</span>
              <h1 className="mt-4 font-display text-4xl leading-tight text-ink">{scenario.title}</h1>
              <p className="mt-3 text-lg text-ink-soft">{scenario.subtitle}</p>

              <article className="prose-scenario mt-10 space-y-4">
                <MDXRemote {...mdxSource} />
              </article>

              <div className="mt-10 flex items-center gap-4">
                <button onClick={() => setStage("run")} className="btn-primary">
                  Начать сценарий
                </button>
                <span className="flex items-center gap-2 text-sm text-ink-faint">
                  <Raptor size={40} mood="idle" still /> будет наблюдать за вашими решениями
                </span>
              </div>
            </motion.div>
          )}

          {stage === "run" && (
            <motion.div key="run" variants={fadeUp} initial="initial" animate="animate" exit="exit">
              <ScenarioRunner questions={scenario.questions} onComplete={handleComplete} />
            </motion.div>
          )}

          {stage === "saving" && (
            <motion.div key="saving" variants={fadeUp} initial="initial" animate="animate" exit="exit" className="py-24 text-center">
              <Raptor size={120} mood="alert" className="mx-auto" />
              <p className="mt-4 animate-pulse font-mono text-sm text-ink-faint">Раптор несёт ответы в логово…</p>
            </motion.div>
          )}

          {stage === "debrief" && result && (
            <motion.div key="debrief" variants={fadeUp} initial="initial" animate="animate" exit="exit" className="space-y-10">
              <Debrief
                scenario={{ ...scenario, body: "" } as Scenario}
                result={result}
              />
              <div className="flex justify-center gap-4 pb-8">
                <Link href="/dashboard" className="btn-secondary">К другим сценариям</Link>
                <Link href="/calibration" className="btn-primary">Посмотреть калибровку</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
