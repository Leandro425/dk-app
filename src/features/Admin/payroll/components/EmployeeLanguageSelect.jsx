import { useState } from 'react'
import { Select, message } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { DEFAULT_LANGUAGE, getLanguageOptions } from '../../../../config/languages'

/** Inline editor for `employee.language`, the language of the employee's statement PDF. */
const EmployeeLanguageSelect = ({ employee }) => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()
    const [messageApi, contextHolder] = message.useMessage()
    const [saving, setSaving] = useState(false)

    const handleChange = async (language) => {
        setSaving(true)
        const { error } = await supabase.from('employee').update({ language }).eq('id', employee.id)
        setSaving(false)
        messageApi.open({
            type: error ? 'error' : 'success',
            content: error ? t('common.messages.errorOccurred') : t('admin.payroll.actions.languageUpdated'),
            duration: 3,
        })
        if (!error) {
            queryClient.invalidateQueries({ queryKey: ['payroll'] })
        }
    }

    return (
        <>
            {contextHolder}
            <Select
                size="small"
                style={{ width: 130 }}
                value={employee.language || DEFAULT_LANGUAGE}
                options={getLanguageOptions(t)}
                loading={saving}
                disabled={saving}
                onChange={handleChange}
            />
        </>
    )
}

export default EmployeeLanguageSelect
