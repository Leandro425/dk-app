import { useQuery } from '@tanstack/react-query'
import { getCustomerSelectOptions } from '../../utils/supabaseQuery'
import { useTranslation } from 'react-i18next'
import { Select } from 'antd'
import { useMemo } from 'react'
const CustomerSelect = ({ supabase, value, onChange, enabled = false, placeholder }) => {
    const { t } = useTranslation()
    const {
        data: options,
        isLoading,
        isFetching,
        isError,
    } = useQuery({
        queryKey: ['customers', 'select'],
        queryFn: () => getCustomerSelectOptions(supabase),
        enabled: enabled,
    })

    // Archived customers are only listed when already selected.
    const visibleOptions = useMemo(
        () => options?.filter((option) => option.active !== false || option.value === value),
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

export default CustomerSelect
