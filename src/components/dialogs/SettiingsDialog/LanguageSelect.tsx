import { Select } from 'antd'

import { useTranslation } from 'react-i18next'
// import useLocalStorage from '../../../hooks/useLocalStorage'
// import { useEffect } from 'react'

const LanguageSelect = () => {
    const { t, i18n } = useTranslation()
    // const [language, setLanguage] = useLocalStorage('language', 'de')

    const handleChange = (value: string) => {
        i18n.changeLanguage(value)
        // setLanguage(value)
    }

    // useEffect(() => {
    //     if (language !== i18n.language) {
    //         i18n.changeLanguage(language)
    //     }
    // }, [i18n, language])

    return (
        <Select
            defaultValue={i18n.language}
            style={{ width: '100%' }}
            onChange={handleChange}
            options={[
                { value: 'de', label: t('settings.languages.german') },
                { value: 'en', label: t('settings.languages.english') },
                { value: 'pl', label: t('settings.languages.polish') },
                { value: 'nl', label: t('settings.languages.dutch') },
                { value: 'dk', label: t('settings.languages.danish') },
                { value: 'ro', label: t('settings.languages.romanian') },
                { value: 'bg', label: t('settings.languages.bulgarian') },
            ]}
        />
    )
}

export default LanguageSelect
