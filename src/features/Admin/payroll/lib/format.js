import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/de'
import 'dayjs/locale/en'
import 'dayjs/locale/pl'
import 'dayjs/locale/nl'
import 'dayjs/locale/da'
import 'dayjs/locale/ro'
import 'dayjs/locale/bg'

dayjs.extend(localizedFormat)

/** App language code -> dayjs locale name. */
const DAYJS_LOCALES = { de: 'de', en: 'en', pl: 'pl', nl: 'nl', dk: 'da', ro: 'ro', bg: 'bg' }

/** App language code -> BCP 47 tag for Intl. */
const INTL_LOCALES = {
    de: 'de-DE',
    en: 'en-GB',
    pl: 'pl-PL',
    nl: 'nl-NL',
    dk: 'da-DK',
    ro: 'ro-RO',
    bg: 'bg-BG',
}

const intlLocale = (language) => INTL_LOCALES[language] ?? INTL_LOCALES.de
const dayjsLocale = (language) => DAYJS_LOCALES[language] ?? DAYJS_LOCALES.de

export const formatMoney = (value, language) =>
    new Intl.NumberFormat(intlLocale(language), { style: 'currency', currency: 'EUR' }).format(Number(value ?? 0))

export const formatNumber = (value, language, digits = 2) =>
    new Intl.NumberFormat(intlLocale(language), {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(Number(value ?? 0))

/** "August 2026" in the given language. */
export const formatMonthName = (month, year, language) =>
    dayjs(new Date(year, month - 1, 1))
        .locale(dayjsLocale(language))
        .format('MMMM YYYY')

/** "Montag, 3. August 2026" in the given language. */
export const formatLongDate = (date, language) => dayjs(date).locale(dayjsLocale(language)).format('dddd, LL')

/** Localised "now" with time, for the generation footer. */
export const formatGenerationDate = (language) => dayjs().locale(dayjsLocale(language)).format('LLL')

/** "HH:mm" from a Postgres time value ("HH:mm:ss"). */
export const formatClock = (time) => (time ? String(time).slice(0, 5) : '')
