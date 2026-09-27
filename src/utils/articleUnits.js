/** Unit codes allowed in `article.unit` (check constraint). Labels live under `units.<code>` in the translations. */
export const ARTICLE_UNITS = ['piece', 'kg', 'crate', 'box', 'pallet', 'bunch']

export const DEFAULT_ARTICLE_UNIT = 'piece'

/** Translated unit label, or '' for an unknown or missing code. */
export const getUnitLabel = (t, unit) => (ARTICLE_UNITS.includes(unit) ? t(`units.${unit}`) : '')

export const getUnitOptions = (t) => ARTICLE_UNITS.map((unit) => ({ value: unit, label: t(`units.${unit}`) }))
