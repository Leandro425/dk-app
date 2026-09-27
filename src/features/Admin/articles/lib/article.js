import { DEFAULT_ARTICLE_UNIT } from '../../../../utils/articleUnits'

/**
 * Article master data, split over two tables:
 * - `article`          fields the whole app reads (pickers, reports, delivery note, payroll)
 * - `article_private`  sales price, admin only
 * Both are written together by the `save_article` database function.
 */

export const PUBLIC_FIELDS = ['external_id', 'name', 'unit', 'active', 'piecework_wage', 'piecework_packaging', 'notes']
export const PRIVATE_FIELDS = ['sales_price']

const DEFAULTS = {
    unit: DEFAULT_ARTICLE_UNIT,
    active: true,
    notes: '',
}

/** Form values for an article row (with `private` embedded), or defaults for a new one. */
export const toFormValues = (article) => ({
    ...Object.fromEntries(PUBLIC_FIELDS.map((field) => [field, article?.[field] ?? DEFAULTS[field] ?? null])),
    ...Object.fromEntries(PRIVATE_FIELDS.map((field) => [field, article?.private?.[field] ?? null])),
})

const normalize = (value) => {
    if (value === undefined || value === null) return null
    if (typeof value === 'string') return value.trim() === '' ? null : value.trim()
    return value
}

/** Payload for `save_article`: every field is sent. */
export const toSavePayload = (values) => ({
    article: Object.fromEntries(PUBLIC_FIELDS.map((field) => [field, normalize(values[field])])),
    private: Object.fromEntries(PRIVATE_FIELDS.map((field) => [field, normalize(values[field])])),
})

const normalizeText = (value) => (value ?? '').toString().trim().toLowerCase()
export const isSameText = (a, b) => Boolean(normalizeText(a)) && normalizeText(a) === normalizeText(b)

// The unique index on article.external_id compares the trimmed value exactly (case-sensitive).
export const isSameNumber = (a, b) => Boolean(a?.toString().trim()) && a.toString().trim() === b?.toString().trim()
