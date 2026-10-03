/**
 * Batch master data (`batch` table): where goods come from, an own field or a purchase.
 * Everyone signed in can read it (report and delivery pickers, delivery note); only admins
 * can write it (RLS). `batch_number` is assigned by the database on insert and, like
 * `type`, never changes afterwards.
 */

export const BATCH_TYPES = ['field', 'purchase']

export const FIELDS = ['type', 'name', 'description', 'external_number', 'active']

const DEFAULTS = {
    type: 'field',
    active: true,
}

/** Form values for a batch row, or defaults for a new one. */
export const toFormValues = (batch) =>
    Object.fromEntries(FIELDS.map((field) => [field, batch?.[field] ?? DEFAULTS[field] ?? null]))

const normalize = (value) => {
    if (value === undefined || value === null) return null
    if (typeof value === 'string') return value.trim() === '' ? null : value.trim()
    return value
}

/** Row for insert (`isNew`) or update. The type is only sent on insert. */
export const toSavePayload = (values, isNew) => {
    const row = Object.fromEntries(FIELDS.map((field) => [field, normalize(values[field])]))
    if (!isNew) delete row.type
    return row
}

const normalizeText = (value) => (value ?? '').toString().trim().toLowerCase()
export const isSameText = (a, b) => Boolean(normalizeText(a)) && normalizeText(a) === normalizeText(b)
