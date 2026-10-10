import ReactMarkdown from "react-markdown";
import type { Scenario } from "@/lib/scenario-schema";

/**
 * Рендер MDX-тела сценария на сервере (static-safe).
 * Тела сценариев используют только общий синтаксис Markdown
 * (заголовки, абзацы, списки, цитаты, курсив/жирный), поэтому
 * react-markdown даёт идентичный результат без RSC-границы.
 */
export default function ScenarioBody({ scenario }: { scenario: Scenario }) {
  return <ReactMarkdown>{scenario.body}</ReactMarkdown>;
}
