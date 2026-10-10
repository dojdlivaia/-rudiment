import { notFound } from "next/navigation";
import { loadScenario, scenarioSlugs } from "@/lib/scenario-engine";
import ScenarioClient from "./ScenarioClient";
import ScenarioBody from "@/components/ScenarioBody";

/**
 * /tests/[slug] — серверная часть: грузит MDX, валидирует через Zod (в движке),
 * рендерит тело сценария на сервере (static-safe) и отдаёт клиентскому раннеру.
 */

export function generateStaticParams() {
  return scenarioSlugs().map((slug) => ({ slug }));
}

export const metadata = { title: "Сценарий · Рудимент" };

export default function TestPage({ params }: { params: { slug: string } }) {
  let scenario;
  try {
    scenario = loadScenario(params.slug);
  } catch {
    notFound();
  }

  // Фронтматтер без тела — прокидываем в клиент типизированно
  const { body: _body, ...front } = scenario;

  return (
    <ScenarioClient
      scenario={front}
      intro={<ScenarioBody scenario={scenario} />}
    />
  );
}
