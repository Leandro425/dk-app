import { useMemo, useState } from 'react'
import { Alert, Button, Flex, Input, Segmented, Table, Tag, Tooltip } from 'antd'
import { PlusOutlined, UpSquareFilled } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useBatches } from '../../hooks/useBatches'
import { BATCH_TYPES } from '../../lib/batch'
import { BATCHES_BASE } from '../../../constants'

export const BatchStatusTag = ({ batch }) => {
    const { t } = useTranslation()
    return batch.active ? (
        <Tag color="green">{t('admin.batches.status.active')}</Tag>
    ) : (
        <Tag>{t('admin.batches.status.archived')}</Tag>
    )
}

export const BatchTypeTag = ({ type }) => {
    const { t } = useTranslation()
    return <Tag color={type === 'field' ? 'lime' : 'blue'}>{t(`admin.batches.types.${type}`)}</Tag>
}

const STATUS_FILTERS = {
    active: (batch) => batch.active,
    archived: (batch) => !batch.active,
    all: () => true,
}

const TYPE_FILTERS = ['all', ...BATCH_TYPES]

const matchesSearch = (batch, search) => {
    if (!search) return true
    const haystack = [batch.batch_number, batch.external_number, batch.name, batch.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
    return search
        .toLowerCase()
        .split(/\s+/)
        .every((term) => haystack.includes(term))
}

const compareText = (a, b) => (a ?? '').toString().localeCompare((b ?? '').toString(), undefined, { numeric: true })

const BatchesTable = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { data: batches = [], isLoading, isError, error } = useBatches()
    const [status, setStatus] = useState('active')
    const [type, setType] = useState('all')
    const [search, setSearch] = useState('')

    const visibleBatches = useMemo(
        () =>
            batches.filter(
                (batch) =>
                    STATUS_FILTERS[status](batch) &&
                    (type === 'all' || batch.type === type) &&
                    matchesSearch(batch, search)
            ),
        [batches, status, type, search]
    )

    const col = (key) => t(`admin.batches.table.columns.${key}`)
    const open = (batch) => navigate(`${BATCHES_BASE}/${batch.id}`)

    const columns = [
        {
            title: col('batchNumber'),
            dataIndex: 'batch_number',
            key: 'batch_number',
            width: 120,
            sorter: (a, b) => compareText(a.batch_number, b.batch_number),
            defaultSortOrder: 'ascend',
        },
        {
            title: col('type'),
            dataIndex: 'type',
            key: 'type',
            render: (value) => <BatchTypeTag type={value} />,
            sorter: (a, b) => compareText(a.type, b.type),
        },
        {
            title: col('name'),
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => compareText(a.name, b.name),
        },
        {
            title: col('description'),
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => compareText(a.description, b.description),
        },
        {
            title: col('externalNumber'),
            dataIndex: 'external_number',
            key: 'external_number',
            sorter: (a, b) => compareText(a.external_number, b.external_number),
        },
        {
            title: col('status'),
            key: 'status',
            render: (_, batch) => <BatchStatusTag batch={batch} />,
        },
        {
            title: col('actions'),
            key: 'actions',
            fixed: 'right',
            width: 80,
            render: (_, batch) => (
                <Tooltip title={t('common.actions.open')}>
                    <Button
                        type="primary"
                        icon={<UpSquareFilled />}
                        onClick={(event) => {
                            event.stopPropagation()
                            open(batch)
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
                        placeholder={t('admin.batches.searchPlaceholder')}
                        style={{ width: 280 }}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Segmented
                        value={type}
                        onChange={setType}
                        options={TYPE_FILTERS.map((key) => ({
                            value: key,
                            label:
                                key === 'all' ? t('admin.batches.filters.allTypes') : t(`admin.batches.types.${key}`),
                        }))}
                    />
                    <Segmented
                        value={status}
                        onChange={setStatus}
                        options={Object.keys(STATUS_FILTERS).map((key) => ({
                            value: key,
                            label: t(`admin.batches.filters.${key}`),
                        }))}
                    />
                </Flex>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`${BATCHES_BASE}/new`)}
                >
                    {t('admin.batches.actions.add')}
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
                dataSource={visibleBatches}
                pagination={{ defaultPageSize: 20, showSizeChanger: true }}
                scroll={{ x: 'max-content' }}
                onRow={(batch) => ({ onClick: () => open(batch), style: { cursor: 'pointer' } })}
            />
        </Flex>
    )
}

export default BatchesTable
