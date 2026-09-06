// Language codes supported by the app UI and by generated documents.
export const LANGUAGE_CODES = ['de', 'en', 'pl', 'nl', 'dk', 'ro', 'bg']

export const DEFAULT_LANGUAGE = 'de'

// Translation keys under `settings.languages.*` for each code.
export const LANGUAGE_LABEL_KEYS = {
    de: 'settings.languages.german',
    en: 'settings.languages.english',
    pl: 'settings.languages.polish',
    nl: 'settings.languages.dutch',
    dk: 'settings.languages.danish',
    ro: 'settings.languages.romanian',
    bg: 'settings.languages.bulgarian',
}

export const getLanguageOptions = (t) =>
    LANGUAGE_CODES.map((code) => ({ value: code, label: t(LANGUAGE_LABEL_KEYS[code]) }))
