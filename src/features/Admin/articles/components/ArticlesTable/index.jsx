import { useMemo, useState } from 'react'
import { Alert, Button, Flex, Input, Segmented, Table, Tag, Tooltip } from 'antd'
import { PlusOutlined, UpSquareFilled } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useArticles } from '../../hooks/useArticles'
import { getUnitLabel } from '../../../../../utils/articleUnits'
import { INTL_LOCALES } from '../../../../../utils/address'
import { ARTICLES_BASE } from '../../../constants'

export const ArticleStatusTag = ({ article }) => {
    const { t } = useTranslation()
    return article.active ? (
        <Tag color="green">{t('admin.articles.status.active')}</Tag>
    ) : (
        <Tag>{t('admin.articles.status.archived')}</Tag>
    )
}

const STATUS_FILTERS = {
    active: (article) => article.active,
    archived: (article) => !article.active,
    all: () => true,
}

const matchesSearch = (article, search) => {
    if (!search) return true
    const haystack = [article.external_id, article.name].filter(Boolean).join(' ').toLowerCase()
    return search
        .toLowerCase()
        .split(/\s+/)
        .every((term) => haystack.includes(term))
}

const compareText = (a, b) => (a ?? '').toString().localeCompare((b ?? '').toString(), undefined, { numeric: true })
const compareNumber = (a, b) => (a ?? -Infinity) - (b ?? -Infinity)

const ArticlesTable = () => {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const { data: articles = [], isLoading, isError, error } = useArticles()
    const [status, setStatus] = useState('active')
    const [search, setSearch] = useState('')

    const visibleArticles = useMemo(
        () => articles.filter((article) => STATUS_FILTERS[status](article) && matchesSearch(article, search)),
        [articles, status, search]
    )

    // Piecework wages can have more than two decimals (e.g. 0.035 € per piece).
    const money = useMemo(() => {
        const format = new Intl.NumberFormat(INTL_LOCALES[i18n.language] ?? i18n.language, {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
        })
        return (value) => (value === null || value === undefined ? '' : format.format(value))
    }, [i18n.language])

    const col = (key) => t(`admin.articles.table.columns.${key}`)
    const open = (article) => navigate(`${ARTICLES_BASE}/${article.id}`)

    const columns = [
        {
            title: col('articleNumber'),
            dataIndex: 'external_id',
            key: 'external_id',
            width: 110,
            sorter: (a, b) => compareText(a.external_id, b.external_id),
        },
        {
            title: col('name'),
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => compareText(a.name, b.name),
            defaultSortOrder: 'ascend',
        },
        {
            title: col('unit'),
            dataIndex: 'unit',
            key: 'unit',
            render: (unit) => getUnitLabel(t, unit),
            sorter: (a, b) => compareText(getUnitLabel(t, a.unit), getUnitLabel(t, b.unit)),
        },
        {
            title: col('pieceworkWage'),
            dataIndex: 'piecework_wage',
            key: 'piecework_wage',
            align: 'right',
            render: money,
            sorter: (a, b) => compareNumber(a.piecework_wage, b.piecework_wage),
        },
        {
            title: col('salesPrice'),
            key: 'sales_price',
            align: 'right',
            render: (_, article) => money(article.private?.sales_price),
            sorter: (a, b) => compareNumber(a.private?.sales_price, b.private?.sales_price),
        },
        {
            title: col('status'),
            key: 'status',
            render: (_, article) => <ArticleStatusTag article={article} />,
        },
        {
            title: col('actions'),
            key: 'actions',
            fixed: 'right',
            width: 80,
            render: (_, article) => (
                <Tooltip title={t('common.actions.open')}>
                    <Button
                        type="primary"
                        icon={<UpSquareFilled />}
                        onClick={(event) => {
                            event.stopPropagation()
                            open(article)
                        }}
                    />
                </Tooltip>
            ),
        },
    ]

    return (
        <Flex
            vertical
            gap={16}
        >
            <Flex
                wrap
                gap={16}
                align="center"
                justify="space-between"
            >
                <Flex
                    wrap
                    gap={16}
                    align="center"
                >
                    <Input.Search
                        allowClear
                        placeholder={t('admin.articles.searchPlaceholder')}
                        style={{ width: 280 }}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Segmented
                        value={status}
                        onChange={setStatus}
                        options={Object.keys(STATUS_FILTERS).map((key) => ({
                            value: key,
                            label: t(`admin.articles.filters.${key}`),
                        }))}
                    />
                </Flex>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`${ARTICLES_BASE}/new`)}
                >
                    {t('admin.articles.actions.add')}
                </Button>
            </Flex>

            {isError && (
                <Alert
                    type="error"
                    showIcon
                    message={t('common.messages.errorOccurred')}
                    description={error?.message}
                />
            )}

            <Table
                size="small"
                rowKey="id"
                loading={isLoading}
                columns={columns}
                dataSource={visibleArticles}
                pagination={{ defaultPageSize: 20, showSizeChanger: true }}
                scroll={{ x: 'max-content' }}
                onRow={(article) => ({ onClick: () => open(article), style: { cursor: 'pointer' } })}
            />
        </Flex>
    )
}

export default ArticlesTable
