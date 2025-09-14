import { Select } from 'antd'

import { useTranslation } from 'react-i18next'

const LanguageSelect = () => {
    const { t, i18n } = useTranslation()

    const handleChange = (value: string) => {
        i18n.changeLanguage(value)
    }

    return (
        <Select
            defaultValue={i18n.language}
            style={{ width: 120 }}
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
