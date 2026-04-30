import { zh } from './zh'
import { en } from './en'

export type Locale = 'zh' | 'en'
export type TranslationKey = keyof typeof zh

const resources: Record<Locale, Record<TranslationKey, string>> = {
  zh: zh as Record<TranslationKey, string>,
  en,
}

export function translate(lang: Locale, key: TranslationKey): string {
  return resources[lang][key] ?? resources.zh[key] ?? key
}

export function translateVars(
  lang: Locale,
  key: TranslationKey,
  vars: Record<string, string | number>
): string {
  let text = resources[lang][key] ?? resources.zh[key] ?? key
  for (const [k, v] of Object.entries(vars)) {
    text = text.replaceAll(`{${k}}`, String(v))
  }
  return text
}
