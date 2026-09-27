import { useQuery } from '@tanstack/react-query'
import { getArticleSelectOptions } from '../../utils/supabaseQuery'
import { useTranslation } from 'react-i18next'
import { Select } from 'antd'
import { useMemo } from 'react'

// `includeArchived` also lists archived articles (e.g. for filtering statistics over past data).
const ArticleSelect = ({ supabase, value, onChange, enabled = false, placeholder, includeArchived = false }) => {
    const { t } = useTranslation()
    const {
        data: options,
        isLoading,
        isFetching,
        isError,
    } = useQuery({
        queryKey: ['articles', 'select'],
        queryFn: () => getArticleSelectOptions(supabase),
        enabled: enabled,
    })

    // Archived articles are only listed when already selected.
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
            options={visibleOptions}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            allowClear
        />
    )
}

export default ArticleSelect
