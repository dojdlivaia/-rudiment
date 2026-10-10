import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { scenarioFrontmatterSchema, type Scenario } from "./scenario-schema";

const CONTENT_DIR = path.join(process.cwd(), "content", "tests");

/**
 * Движок сценариев: читает MDX из content/tests, валидирует фронтматтер через Zod.
 * Ошибка валидации — понятное сообщение с именем файла (падает рано и громко).
 */
export function loadScenario(slug: string): Scenario {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Сценарий «${slug}» не найден: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  // slug в файле должен совпадать с именем файла
  const parsed = scenarioFrontmatterSchema.safeParse({ ...data, slug });
  if (!parsed.success) {
    throw new Error(
      `Фронтматтер «${slug}.mdx» не соответствует схеме:\n` +
        parsed.error.issues
          .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
          .join("\n"),
    );
  }
  return { ...parsed.data, body: content.trim() };
}

export function listScenarios(): Scenario[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => loadScenario(f.replace(/\.mdx$/, "")))
    .sort((a, b) => a.order - b.order);
}

export function scenarioSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
