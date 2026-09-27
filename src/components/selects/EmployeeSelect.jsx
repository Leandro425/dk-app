import { useQuery } from '@tanstack/react-query'
import { getEmployeeSelectOptions } from '../../utils/supabaseQuery'
import { useTranslation } from 'react-i18next'
import { Select } from 'antd'
import { useMemo } from 'react'

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

    // Employees who have left are not offered, but an already selected one stays visible.
    const visibleOptions = useMemo(
        () => options?.filter((option) => option.active || option.value === value),
        [options, value]
    )

    return (
        <Select
            showSearch
            loading={isLoading || isFetching}
            notFoundContent={isError ? t('common.messages.errorOccurred') : t('common.placeholders.noData')}
            placeholder={placeholder || t('common.placeholders.selectOption')}
            value={value}
            onChange={(value) => onChange(value)}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            options={visibleOptions}
            allowClear
        />
    )
}

export default EmployeeSelect
