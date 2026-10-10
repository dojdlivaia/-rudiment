"use client";

import { motion } from "framer-motion";
import type { ScenarioResult } from "@/lib/metrics";
import type { Scenario } from "@/lib/scenario-schema";
import Raptor, { RaptorSpeech } from "@/components/mascot/Raptor";
import { DUR, EASING, fadeUp, staggerParent } from "@/lib/motion";

/**
 * Разбор после сценария: метрики + эволюционный «паспорт» искажения + раптор.
 * Тон: тёплый, ироничный. Не «ты ошибся», а «твой раптор сработал быстрее».
 */

export default function Debrief({ scenario, result }: { scenario: Scenario; result: ScenarioResult }) {
  const sus = Math.round(result.susceptibility * 100);
  const mood = result.susceptibility <= 0.3 ? "smug" : result.susceptibility >= 0.65 ? "facepaw" : "alert";

  const headline =
    mood === "smug"
      ? "Совесть бежала быстрее раптора. Редкий вид."
      : mood === "facepaw"
        ? "Твой раптор сработал быстрее сознания — почти как в мелу."
        : "Раптор был рядом, но ты удержал верёвку. Наполовину.";

  return (
    <motion.div variants={staggerParent} initial="initial" animate="animate" className="mx-auto max-w-2xl space-y-8">
      {/* Раптор + заголовок */}
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <Raptor mood={mood} size={96} />
        <div>
          <h2 className="font-display text-2xl leading-tight text-ink">{headline}</h2>
          <p className="mt-1 text-sm text-ink-faint">{scenario.debriefTitle}</p>
        </div>
      </motion.div>

      {/* Метрики */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        <Metric label="Подверженность якорению" value={`${sus}%`} tone={sus > 60 ? "clay" : sus > 35 ? "amber" : "moss"} hint="0% — чистая совесть, 100% — полный раптор" />
        <Metric label="Brier (калибровка)" value={result.meanBrier.toFixed(2)} tone={result.meanBrier < 0.15 ? "moss" : result.meanBrier < 0.3 ? "amber" : "clay"} hint="меньше — лучше; 0 = идеал" />
        <Metric
          label="Overconfidence"
          value={`${result.overconfidence >= 0 ? "+" : ""}${Math.round(result.overconfidence * 100)}%`}
          tone={Math.abs(result.overconfidence) < 0.1 ? "moss" : "amber"}
          hint="уверенность минус точность"
        />
      </motion.div>

      {/* Эволюционный паспорт */}
      <motion.div variants={fadeUp} className="card overflow-hidden">
        <div className="border-b border-sand-100 bg-sand-50 px-6 py-4">
          <h3 className="font-display text-lg text-ink">Паспорт рудимента</h3>
          <p className="text-xs uppercase tracking-wide text-ink-faint">искажение · {scenario.bias}</p>
        </div>
        <div className="grid gap-0 sm:grid-cols-2">
          <div className="border-r border-sand-100 p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-moss">Где спасало</p>
            <p className="prose-scenario text-[15px]">{scenario.origin}</p>
          </div>
          <div className="p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-clay-dark">Где подводит</p>
            <p className="prose-scenario text-[15px]">{scenario.modernCost}</p>
          </div>
        </div>
      </motion.div>

      {/* Что делать */}
      <motion.div variants={fadeUp}>
        <RaptorSpeech mood="idle">
          <strong className="text-ink">Противоядие:</strong> перед любым решением с числом — спроси себя
          «откуда взялось первое число?» и назови альтернативный якорь вслух. Два якоря держат лучше, чем один.
        </RaptorSpeech>
      </motion.div>
    </motion.div>
  );
}

function Metric({ label, value, tone, hint }: { label: string; value: string; tone: "clay" | "amber" | "moss"; hint: string }) {
  const colors = { clay: "text-clay-dark", amber: "text-amber", moss: "text-moss" };
  return (
    <div className="card p-4 text-center">
      <motion.p
        className={`font-mono text-2xl tabular-nums ${colors[tone]}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.slow, ease: EASING, delay: 0.15 }}
      >
        {value}
      </motion.p>
      <p className="mt-1 text-xs font-medium leading-snug text-ink">{label}</p>
      <p className="mt-1 text-[11px] leading-snug text-ink-faint">{hint}</p>
    </div>
  );
}
