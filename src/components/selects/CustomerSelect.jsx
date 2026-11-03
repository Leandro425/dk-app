import { useQuery } from '@tanstack/react-query'
import { getCustomerSelectOptions } from '../../utils/supabaseQuery'
import { useTranslation } from 'react-i18next'
import { Select } from 'antd'
import { useMemo } from 'react'
// `includeArchived` also lists archived customers (e.g. for filtering past deliveries).
const CustomerSelect = ({
    supabase,
    value,
    onChange,
    enabled = false,
    placeholder,
    includeArchived = false,
    style,
}) => {
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
        () =>
            includeArchived ? options : options?.filter((option) => option.active !== false || option.value === value),
        [options, value, includeArchived]
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
            style={style}
        />
    )
}

export default CustomerSelect
