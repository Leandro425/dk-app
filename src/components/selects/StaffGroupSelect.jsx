import { useQuery } from '@tanstack/react-query'
import { getStaffGroupSelectOptions } from '../../utils/supabaseQuery'
import { useTranslation } from 'react-i18next'
import { Select } from 'antd'
const StaffGroupSelect = ({ supabase, value, onChange, enabled = false, placeholder }) => {
    const { t } = useTranslation()
    const {
        data: options,
        isLoading,
        isFetching,
        isError,
    } = useQuery({
        queryKey: ['staffGroups', 'select'],
        queryFn: () => getStaffGroupSelectOptions(supabase),
        enabled: enabled,
    })

    return (
        <Select
            showSearch
            loading={isLoading || isFetching}
            notFoundContent={isError ? t('common.messages.errorOccurred') : t('common.placeholders.noData')}
            placeholder={placeholder || t('common.placeholders.selectOption')}
            value={value}
            onChange={(value) => onChange(value)}
            options={options}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            style={{ width: '100%' }}
            allowClear
        />
    )
}

export default StaffGroupSelect
