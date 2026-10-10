import Link from "next/link";
import Raptor from "@/components/mascot/Raptor";

/** Лендинг «Рудимента» — маркетинговая зона (app/(marketing)). */
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-20 text-center">
        <span className="badge mb-6 bg-clay-wash text-clay-dark">
          <RaptorGlyph /> тренировочный полигон для совести
        </span>
        <h1 className="max-w-3xl font-display text-5xl leading-[1.1] text-ink sm:text-6xl">
          Твой раптор срабатывает <span className="text-clay">быстрее тебя</span>. Научись это замечать.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Когнитивные искажения — не баг, а рудимент: древние эвристики, которые спасали
          в мелу и мешают на переговорах. «Рудимент» ставит вас в живые сценарии и
          показывает, кто только что принял решение.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/dashboard" className="btn-primary">Пройти первый сценарий</Link>
          <Link href="/calibration" className="btn-secondary">Кривая калибровки</Link>
        </div>

        {/* Маскот */}
        <div className="relative mt-16">
          <Raptor mood="alert" size={260} />
          <span className="absolute -right-24 top-8 hidden rotate-6 rounded-card border border-sand-200 bg-surface px-3 py-2 font-mono text-sm text-ink-soft shadow-soft sm:block">
            колесо показало 900 → цена клубники +40%
          </span>
          <span className="absolute -left-28 top-32 hidden -rotate-3 rounded-card border border-sand-200 bg-surface px-3 py-2 font-mono text-sm text-ink-soft shadow-soft sm:block">
            sunk cost: «мы уже столько вложили…»
          </span>
        </div>
      </section>

      {/* Как это работает */}
      <section className="border-t border-sand-100 bg-sand-50/60">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="mb-12 text-center font-display text-3xl text-ink">Как устроен полигон</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <Step n="01" title="Сценарий" text="Шесть живых ситуаций: якорение, невозвратные затраты, подтверждение своей правоты, базовые ставки, Монти Холл и «я же знал». Никаких лекций — только выбор." />
            <Step n="02" title="Уверенность" text="После каждого ответа — слайдер уверенности. Мы сравниваем её с реальностью: так рождается ваша кривая калибровки." />
            <Step n="03" title="Разбор" text="Тёплый, ироничный, без морализаторства. Не «ты ошибся», а «твой раптор сработал быстрее». Плюс метрика подверженности." />
          </div>
        </div>
      </section>

      {/* Шесть искажений */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="mb-4 text-center font-display text-3xl text-ink">Местная фауна</h2>
        <p className="mb-12 text-center text-ink-soft">Шесть рудиментов, шесть сценариев. Начните с якорения — оно самое подленькое.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["anchoring", "Якорение", "Первое число управляет всеми остальными"],
            ["sunk-cost", "Невозвратные затраты", "Дожить плохой фильм до конца из уважения к билету"],
            ["confirmation-bias", "Подтверждение своей правоты", "Искать только то, что подтверждает"],
            ["base-rate", "Игнор базовой ставки", "«Он похож на библиотекаря!» — а их 3%"],
            ["monty-hall", "Парадокс Монти Холла", "Менять дверь страшно. И правильно? Нет"],
            ["hindsight", "Ретроспектив", "«Я же говорил» — задним умом крепки"],
          ].map(([slug, title, sub]) => (
            <Link
              key={slug}
              href={`/tests/${slug}`}
              className="card group p-6 transition-all duration-250 ease-rudiment hover:-translate-y-0.5 hover:shadow-lift"
            >
              <p className="font-display text-lg text-ink group-hover:text-clay-dark">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{sub}</p>
              <p className="mt-4 font-mono text-xs uppercase tracking-wide text-clay">пройти →</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-sand-100 py-10 text-center text-sm text-ink-faint">
        Рудимент · эволюция не обязывала нас быть правыми — только живыми
      </footer>
    </main>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="card p-6">
      <p className="font-mono text-sm text-clay">{n}</p>
      <h3 className="mt-2 font-display text-xl text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}

function RaptorGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 200 200" aria-hidden>
      <path d="M60 150 Q 55 105 85 82 Q 115 62 140 78 Q 160 92 152 122 Q 146 148 118 156 Q 85 162 60 150 Z" fill="#D97742" stroke="#1F1B16" strokeWidth="8" />
    </svg>
  );
}
