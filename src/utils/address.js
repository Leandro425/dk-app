// Countries and postal addresses (customer master data, delivery note).

export const DEFAULT_COUNTRY = 'DE'

// Countries offered first in the pickers: Germany and its neighbours, then the rest of Europe.
const COUNTRY_CODES = [
    'DE',
    'AT',
    'CH',
    'NL',
    'BE',
    'LU',
    'FR',
    'DK',
    'PL',
    'CZ',
    'IT',
    'ES',
    'PT',
    'GB',
    'IE',
    'SE',
    'NO',
    'FI',
    'IS',
    'EE',
    'LV',
    'LT',
    'SK',
    'HU',
    'SI',
    'HR',
    'RO',
    'BG',
    'GR',
    'CY',
    'MT',
    'LI',
    'MC',
    'RS',
    'BA',
    'ME',
    'MK',
    'AL',
    'XK',
    'MD',
    'UA',
    'TR',
    'US',
]

// App language code -> BCP 47 locale (country names, number formats).
export const INTL_LOCALES = { dk: 'da' }

export const getCountryName = (code, language) => {
    if (!code) return ''
    try {
        const names = new Intl.DisplayNames([INTL_LOCALES[language] ?? language ?? 'de'], { type: 'region' })
        return names.of(code) ?? code
    } catch {
        return code
    }
}

export const getCountryOptions = (language) =>
    COUNTRY_CODES.map((code) => ({ value: code, label: `${getCountryName(code, language)} (${code})` }))

/**
 * Address lines for documents: street, ZIP + city, and the country when it is not Germany.
 * `prefix` selects the columns: `address` (main address) or `billing`.
 */
export const getAddressLines = (customer, language, prefix = 'address') => {
    if (!customer) return []
    const get = (field) => customer[`${prefix}_${field}`] ?? ''
    const street = [get('street'), get('house_number')].filter(Boolean).join(' ')
    const city = [get('zip_code'), get('city')].filter(Boolean).join(' ')
    const country = get('country') && get('country') !== DEFAULT_COUNTRY ? getCountryName(get('country'), language) : ''
    return [street, city, country].filter(Boolean)
}
