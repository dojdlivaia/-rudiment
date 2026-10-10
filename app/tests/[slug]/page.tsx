import { notFound } from "next/navigation";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote/serialize";
import { loadScenario, scenarioSlugs } from "@/lib/scenario-engine";
import ScenarioClient from "./ScenarioClient";

/**
 * /tests/[slug] — серверная часть: грузит MDX, валидирует через Zod (в движке),
 * сериализует тело сценария и отдаёт клиентскому раннеру.
 */

export function generateStaticParams() {
  return scenarioSlugs().map((slug) => ({ slug }));
}

export const metadata = { title: "Сценарий · Рудимент" };

export default async function TestPage({ params }: { params: { slug: string } }) {
  let scenario;
  try {
    scenario = loadScenario(params.slug);
  } catch {
    notFound();
  }

  const mdx = (await MDXRemote.serialize({
    source: scenario.body,
  })) as MDXRemoteSerializeResult;

  // Фронтматтер без тела — прокидываем в клиент типизированно
  const { body: _body, ...front } = scenario;

  return <ScenarioClient scenario={front} mdxSource={mdx} />;
}
