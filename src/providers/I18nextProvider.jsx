import { I18nextProvider as I18nextProvider_ } from 'react-i18next'
import { initReactI18next } from 'react-i18next'

import 'intl-pluralrules'

import { createInstance } from 'i18next'

import translationDE from '../locales/de/translation.json'
import translationEN from '../locales/en/translation.json'
import translationPL from '../locales/pl/translation.json'

const resources = {
    en: {
        translation: translationEN,
    },
    de: {
        translation: translationDE,
    },
    pl: {
        translation: translationPL,
    },
}

const i18n = createInstance()

i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,
    lng: 'en', // change in production to de
    fallbackLng: 'en', // use en if detected lng is not available
    debug: false, // TODO disable in production
    interpolation: {
        escapeValue: false,
    },
})

const I18nextProvider = ({ children }) => {
    return <I18nextProvider_ i18n={i18n}>{children}</I18nextProvider_>
}

export default I18nextProvider
