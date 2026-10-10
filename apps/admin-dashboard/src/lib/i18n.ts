import english from "../locales/en.json";
import tamil from "../locales/ta.json";

export type Language = "en" | "ta";
type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = { en: english, ta: tamil };

export function translate(
  language: Language,
  key: string,
  values: Record<string, string | number> = {},
): string {
  const template = dictionaries[language][key] ?? dictionaries.en[key] ?? key;
  return template.replace(/\{\{(\w+)\}\}/g, (placeholder, name: string) =>
    String(values[name] ?? placeholder),
  );
}
