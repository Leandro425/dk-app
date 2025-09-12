import { Select } from 'antd'

import { useTranslation } from 'react-i18next'

const LanguageSelect = () => {
    const { t, i18n } = useTranslation()

    const handleChange = (value: string) => {
        i18n.changeLanguage(value)
    }

    console.log('Current language:', i18n.language)

    return (
        <Select
            defaultValue={i18n.language}
            style={{ width: 120 }}
            onChange={handleChange}
            options={[
                { value: 'de', label: t('settings.languages.german') },
                { value: 'en', label: t('settings.languages.english') },
                { value: 'pl', label: t('settings.languages.polish') },
            ]}
        />
    )
}

export default LanguageSelect
