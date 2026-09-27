import { DEFAULT_COUNTRY } from '../../../../utils/address'

/**
 * Customer master data (`customer` table). Everyone signed in can read it (delivery
 * picker, delivery note); only admins can write it (RLS).
 */

const MAIN_ADDRESS_FIELDS = [
    'address_street',
    'address_house_number',
    'address_zip_code',
    'address_city',
    'address_country',
]

export const BILLING_FIELDS = [
    'billing_name',
    'billing_street',
    'billing_house_number',
    'billing_zip_code',
    'billing_city',
    'billing_country',
]

export const FIELDS = [
    'customer_number',
    'name',
    'active',
    ...MAIN_ADDRESS_FIELDS,
    'billing_differs',
    ...BILLING_FIELDS,
    'payment_term_days',
    'vat_id',
    'email',
    'phone',
    'contact_person',
    'notes',
]

const DEFAULTS = {
    active: true,
    billing_differs: false,
    address_country: DEFAULT_COUNTRY,
    billing_country: DEFAULT_COUNTRY,
    notes: '',
}

/** Form values for a customer row, or defaults for a new one. */
export const toFormValues = (customer) =>
    Object.fromEntries(FIELDS.map((field) => [field, customer?.[field] ?? DEFAULTS[field] ?? null]))

const normalize = (value) => {
    if (value === undefined || value === null) return null
    if (typeof value === 'string') return value.trim() === '' ? null : value.trim()
    return value
}

/** Row for insert/update. Every field is sent; billing fields are cleared when the billing address does not differ. */
export const toSavePayload = (values) => {
    const row = Object.fromEntries(FIELDS.map((field) => [field, normalize(values[field])]))
    if (!row.billing_differs) {
        for (const field of BILLING_FIELDS) row[field] = null
    }
    return row
}

const compact = (value) => (value ?? '').replace(/\s+/g, '').toUpperCase()

// EU VAT ID (USt-IdNr.): country prefix and 2-12 characters; German ones are DE + 9 digits.
const VAT_ID_PATTERN = /^[A-Z]{2}[0-9A-Z+*.]{2,12}$/
const DE_VAT_ID_PATTERN = /^DE\d{9}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DE_ZIP_PATTERN = /^\d{5}$/

/** Format problems that do not block saving. */
export const isVatIdSuspicious = (value) => {
    const vatId = compact(value)
    if (!vatId) return false
    return vatId.startsWith('DE') ? !DE_VAT_ID_PATTERN.test(vatId) : !VAT_ID_PATTERN.test(vatId)
}
export const isEmailSuspicious = (value) => Boolean(value?.trim()) && !EMAIL_PATTERN.test(value.trim())
export const isZipCodeSuspicious = (zip, country) =>
    Boolean(zip?.trim()) && (country ?? DEFAULT_COUNTRY) === DEFAULT_COUNTRY && !DE_ZIP_PATTERN.test(zip.trim())

const normalizeName = (value) => (value ?? '').trim().toLowerCase()
export const isSameName = (a, b) => Boolean(normalizeName(a)) && normalizeName(a) === normalizeName(b)
