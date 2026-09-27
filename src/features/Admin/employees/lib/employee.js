import { DEFAULT_LANGUAGE } from '../../../../config/languages'
import { dateStringToDayjs } from '../../../../utils/helpers'

/**
 * Employee master data, split over two tables:
 * - `employee`          fields the whole app reads (pickers, reports, payroll)
 * - `employee_private`  personal, tax and pay data, admin only
 * Both are written together by the `save_employee` database function.
 */

export const PUBLIC_DATE_FIELDS = ['entry_date', 'exit_date']
export const PUBLIC_FIELDS = [
    'staff_number',
    'staff_number_dk',
    'firstname',
    'lastname',
    'staff_group_id',
    'language',
    ...PUBLIC_DATE_FIELDS,
]

export const PRIVATE_DATE_FIELDS = ['birthday', 'pay_rate_valid_from']
export const PRIVATE_FIELDS = [
    'address_street',
    'address_house_number',
    'address_zip_code',
    'address_city',
    'place_of_birth',
    'country_of_birth',
    'nationality',
    'gender',
    'marital_status',
    'children',
    'job_title',
    'contract_type',
    'pay_type',
    'standard_pay',
    'pay_rate',
    'social_security_number',
    'tax_id',
    ...PRIVATE_DATE_FIELDS,
]

// Stored values (German, as in DATEV) must match the check constraints on employee_private.
// Labels come from `admin.employees.values.<field>.<value>`.
export const GENDERS = ['m', 'w', 'd']
export const MARITAL_STATUSES = ['ledig', 'verheiratet', 'verwitwet', 'geschieden', 'eingetragene Lebenspartnerschaft']
export const CONTRACT_TYPES = ['unbefristet', 'befristet', 'Zweckbefristet']

const VALUE_KEYS = {
    gender: { m: 'male', w: 'female', d: 'diverse' },
    marital_status: {
        ledig: 'single',
        verheiratet: 'married',
        verwitwet: 'widowed',
        geschieden: 'divorced',
        'eingetragene Lebenspartnerschaft': 'civilPartnership',
    },
    contract_type: { unbefristet: 'permanent', befristet: 'fixedTerm', Zweckbefristet: 'purposeLimited' },
}

export const getValueOptions = (t, field, values) =>
    values.map((value) => ({ value, label: t(`admin.employees.values.${field}.${VALUE_KEYS[field][value]}`) }))

const toDayjsFields = (row, fields) =>
    Object.fromEntries(fields.map((field) => [field, dateStringToDayjs(row?.[field])]))

const pick = (row, fields, fallback = null) =>
    Object.fromEntries(fields.map((field) => [field, row?.[field] ?? fallback]))

/** Form values for an employee row (with `private` embedded), or defaults for a new one. */
export const toFormValues = (employee, defaults = {}) => {
    const priv = employee?.private ?? {}
    return {
        ...pick(employee, PUBLIC_FIELDS),
        ...pick(priv, PRIVATE_FIELDS),
        ...toDayjsFields(employee, PUBLIC_DATE_FIELDS),
        ...toDayjsFields(priv, PRIVATE_DATE_FIELDS),
        language: employee?.language ?? DEFAULT_LANGUAGE,
        ...defaults,
    }
}

const normalize = (value) => {
    if (value === undefined || value === null) return null
    if (typeof value === 'string') return value.trim() === '' ? null : value.trim()
    if (typeof value?.format === 'function') return value.format('YYYY-MM-DD')
    return value
}

const normalizeFields = (values, fields) => Object.fromEntries(fields.map((field) => [field, normalize(values[field])]))

/** `{ employee, private }` payload for `save_employee`. Every field is sent, so a save fully replaces both rows. */
export const toSavePayload = (values) => ({
    employee: normalizeFields(values, PUBLIC_FIELDS),
    private: normalizeFields(values, PRIVATE_FIELDS),
})

// German social security number (Rentenversicherungsnummer): 8 digits, a capital letter, 3 digits.
const SSN_PATTERN = /^\d{8}[A-Z]\d{3}$/
// German tax identification number (Steuer-ID): 11 digits.
const TAX_ID_PATTERN = /^\d{11}$/

const compact = (value) => (value ?? '').replace(/\s+/g, '')

/** Format problems that do not block saving (old data may not follow them). */
export const isSocialSecurityNumberSuspicious = (value) => Boolean(compact(value)) && !SSN_PATTERN.test(compact(value))
export const isTaxIdSuspicious = (value) => Boolean(compact(value)) && !TAX_ID_PATTERN.test(compact(value))
