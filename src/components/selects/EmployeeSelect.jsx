import { useQuery } from '@tanstack/react-query'
import { getEmployeeSelectOptions } from '../../utils/supabaseQuery'
import { useTranslation } from 'react-i18next'
import { Select } from 'antd'

const EmployeeSelect = ({ supabase, value, onChange, staffgroup, enabled = false, placeholder }) => {
    const { t } = useTranslation()

    const {
        data: options,
        isLoading,
        isFetching,
        isError,
    } = useQuery({
        queryKey: ['employees', 'select', staffgroup],
        queryFn: () => getEmployeeSelectOptions(supabase, staffgroup),
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
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            options={options}
            allowClear
        />
    )
}

export default EmployeeSelect
