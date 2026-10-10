import Link from "next/link";
import { listScenarios } from "@/lib/scenario-engine";
import { BIAS_LABELS } from "@/lib/metrics";

/** Дашборд: список доступных сценариев (app/(app)). */
export default function DashboardPage() {
  const scenarios = listScenarios(); // пока в движке только anchoring — остальные добавляются как .mdx

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Полигон</h1>
          <p className="mt-2 text-ink-soft">Выберите сценарий. Раптор уже ждёт.</p>
        </div>
        <Link href="/calibration" className="btn-secondary">Кривая калибровки</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {scenarios.map((s) => (
          <Link
            key={s.slug}
            href={`/tests/${s.slug}`}
            className="card group p-6 transition-all duration-250 ease-rudiment hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="flex items-center justify-between">
              <span className="badge bg-clay-wash text-clay-dark">{BIAS_LABELS[s.bias]}</span>
              <span className="font-mono text-xs text-ink-faint">~{Math.round(s.durationSec / 60)} мин</span>
            </div>
            <h2 className="mt-4 font-display text-xl text-ink group-hover:text-clay-dark">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.subtitle}</p>
            <p className="mt-4 font-mono text-xs uppercase tracking-wide text-clay">
              {s.questions.length} вопрос{s.questions.length > 1 ? "а" : ""} · начать →
            </p>
          </Link>
        ))}

        {/* Пустые слоты «скоро» — раптор охраняет заготовки */}
        {["sunk-cost", "confirmation-bias", "base-rate", "monty-hall", "hindsight"]
          .filter((b) => !scenarios.some((s) => s.bias === b))
          .map((b) => (
            <div key={b} className="card flex items-center gap-4 border-dashed p-6 opacity-70">
              <ComingSoon />
              <div>
                <p className="font-display text-lg text-ink">{BIAS_LABELS[b as keyof typeof BIAS_LABELS]}</p>
                <p className="text-sm text-ink-faint">Скоро вылупится. Раптор насиживает сценарий.</p>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}

function ComingSoon() {
  return (
    <svg width="56" height="56" viewBox="0 0 200 200" aria-hidden className="shrink-0">
      <ellipse cx="100" cy="120" rx="52" ry="60" fill="#F2A97B" stroke="#1F1B16" strokeWidth="4" />
      <path d="M60 100 Q 100 78 140 100" stroke="#1F1B16" strokeWidth="4" fill="none" />
      <circle cx="86" cy="118" r="5" fill="#1F1B16" />
      <circle cx="114" cy="118" r="5" fill="#1F1B16" />
    </svg>
  );
}
