import { Select } from 'antd'

import { useTranslation } from 'react-i18next'
import useSupervisorContext from '../../../context/user/supervisorContext'
import useSupabaseContext from '../../../context/supabase/supabaseContext'

const LanguageSelect = () => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const { supervisor, refetch } = useSupervisorContext()

    const handleChange = async (value) => {
        const res = await supabase.from('Supervisor').update({ language: value }).eq('id', supervisor.id)
        if (!res.error) {
            refetch()
        }
    }

    return (
        <Select
            defaultValue={supervisor?.language || 'de'}
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
