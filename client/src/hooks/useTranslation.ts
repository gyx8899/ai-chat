import { useCallback } from 'react'
import { useUIStore } from '@/store/uiStore'
import { translate, translateVars, type TranslationKey } from '@/locales'

export function useTranslation() {
  const lang = useUIStore(s => s.lang)

  const t = useCallback((key: TranslationKey) => translate(lang, key), [lang])

  const tv = useCallback(
    (key: TranslationKey, vars: Record<string, string | number>) => translateVars(lang, key, vars),
    [lang]
  )

  return { t, tv, lang }
}
