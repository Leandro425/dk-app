import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Card, DatePicker, Flex, Popconfirm, Segmented, Space, Table, Tooltip, Typography, message } from 'antd'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import AddDeliveryModal from '../modals/AddDeliveryModal'
import EditDeliveryModal from '../modals/EditDeliveryModal'
import { formatDate, formatDateTime, getCustomerLabel, getSupervisorLabel } from '../../../../utils/helpers'
import { ClearOutlined, DeleteFilled, EditFilled, UpSquareFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import DeliveryStatusActions, { DeliveryStatusTag } from '../DeliveryStatusActions'
import { isDeliveryCompleted } from '../../hooks/useDeliveryStatusActions'
import { LANGUAGE_LABEL_KEYS } from '../../../../config/languages'
import useLocalStorage from '../../../../hooks/useLocalStorage'
import CustomerSelect from '../../../../components/selects/CustomerSelect'

const { Text } = Typography

const DATE_FORMAT = 'YYYY-MM-DD'
const STATUS_FILTERS = ['all', 'open', 'done']
const DEFAULT_FILTERS = { status: 'all', dateFrom: null, dateTo: null, customer: null }
const FILTERS_STORAGE_KEY = 'deliveries.filters'

// Stored filters may come from an older version of the page: fill gaps and drop unknown keys.
const sanitizeFilters = (stored) => {
    const filters = Object.fromEntries(
        Object.keys(DEFAULT_FILTERS).map((key) => [key, stored?.[key] ?? DEFAULT_FILTERS[key]])
    )
    return STATUS_FILTERS.includes(filters.status) ? filters : { ...filters, status: DEFAULT_FILTERS.status }
}

const filtersActive = (filters) => Object.keys(DEFAULT_FILTERS).some((key) => filters[key] !== DEFAULT_FILTERS[key])

const DeliveriesTable = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { supabase } = useSupabaseContext()
    const [messageApi, contextHolder] = message.useMessage()
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
    const [openAddModal, setOpenAddModal] = useState(false)
    const [selectedDelivery, setSelectedDelivery] = useState(null)
    const [openEditModal, setOpenEditModal] = useState(false)
    const [storedFilters, setFilters] = useLocalStorage(FILTERS_STORAGE_KEY, DEFAULT_FILTERS)
    const filters = useMemo(() => sanitizeFilters(storedFilters), [storedFilters])

    const resetPage = () => setPagination((current) => ({ ...current, current: 1 }))
    const setFilter = (key) => (value) => {
        setFilters((current) => ({ ...sanitizeFilters(current), [key]: value ?? DEFAULT_FILTERS[key] }))
        resetPage()
    }
    const setDateRange = (range) => {
        setFilters((current) => ({
            ...sanitizeFilters(current),
            dateFrom: range?.[0] ? range[0].format(DATE_FORMAT) : null,
            dateTo: range?.[1] ? range[1].format(DATE_FORMAT) : null,
        }))
        resetPage()
    }
    const resetFilters = () => {
        setFilters(DEFAULT_FILTERS)
        resetPage()
    }

    const fetchData = async ({ queryKey }) => {
        const [, page, pageSize, filters] = queryKey
        const from = (page - 1) * pageSize
        const to = page * pageSize - 1
        let query = supabase
            .from('delivery')
            .select(
                '*, customer:customer(*), created_by:supervisor!delivery_created_by_id_fkey(*), modified_by:supervisor!delivery_modified_by_id_fkey(*)',
                {
                    count: 'exact',
                }
            )
        if (filters.status === 'open') query = query.is('completed_at', null)
        if (filters.status === 'done') query = query.not('completed_at', 'is', null)
        if (filters.dateFrom) query = query.gte('date', filters.dateFrom)
        if (filters.dateTo) query = query.lte('date', filters.dateTo)
        if (filters.customer) query = query.eq('customer_id', filters.customer)
        const { data, count, error } = await query.range(from, to).order('number', { ascending: false })
        if (error) {
            return { data: [], total: 0 }
        }
        return { data, total: count }
    }

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['deliveries', pagination.current, pagination.pageSize, filters],
        queryFn: fetchData,
        keepPreviousData: true,
    })

    const handleDelete = async (deliveryId) => {
        const { error } = await supabase.from('delivery').delete().eq('id', deliveryId)

        messageApi.open({
            type: error ? 'error' : 'success',
            content: error ? t('common.messages.errorOccurred') : t('common.messages.successfullyUpdated'),
            duration: 3,
        })

        if (!error) {
            refetch()
        }
    }

    const columns = [
        { title: t('deliveries.table.columns.number'), dataIndex: 'number', key: 'number' },
        {
            title: t('deliveries.table.columns.status'),
            key: 'status',
            render: (_, delivery) => <DeliveryStatusTag delivery={delivery} />,
        },
        { title: t('deliveries.table.columns.date'), dataIndex: 'date', key: 'date', render: formatDate },
        {
            title: t('deliveries.table.columns.customer'),
            dataIndex: 'customer',
            key: 'customer',
            render: getCustomerLabel,
        },
        { title: t('deliveries.table.columns.annotation'), dataIndex: 'annotation', key: 'annotation' },
        {
            title: t('deliveries.table.columns.language'),
            dataIndex: 'pdf_language',
            key: 'pdf_language',
            render: (lang) => (LANGUAGE_LABEL_KEYS[lang] ? t(LANGUAGE_LABEL_KEYS[lang]) : lang),
        },
        {
            title: t('deliveries.table.columns.completedAt'),
            dataIndex: 'completed_at',
            key: 'completed_at',
            render: formatDateTime,
        },
        {
            title: t('deliveries.table.columns.modifiedBy'),
            dataIndex: 'modified_by',
            key: 'modified_by',
            render: getSupervisorLabel,
        },
        {
            title: t('deliveries.table.columns.modifiedAt'),
            dataIndex: 'modified_at',
            key: 'modified_at',
            render: formatDateTime,
        },
        {
            title: t('deliveries.table.columns.createdBy'),
            dataIndex: 'created_by',
            key: 'created_by',
            render: getSupervisorLabel,
        },
        {
            title: t('deliveries.table.columns.createdAt'),
            dataIndex: 'created_at',
            key: 'created_at',
            render: formatDateTime,
        },
        {
            title: t('deliveries.table.columns.actions'),
            key: 'operation',
            fixed: 'right',
            width: 220,
            render: (_, delivery) => {
                const locked = isDeliveryCompleted(delivery)
                return (
                    <Flex
                        gap={8}
                        flex={1}
                        justify="center"
                        align="center"
                    >
                        <DeliveryStatusActions delivery={delivery} />
                        <Button
                            type="primary"
                            icon={<UpSquareFilled />}
                            onClick={() => {
                                navigate(`${delivery.id}`)
                            }}
                        />
                        <Tooltip title={locked ? t('deliveries.status.lockedHint') : null}>
                            <Button
                                type="primary"
                                icon={<EditFilled />}
                                disabled={locked}
                                onClick={() => {
                                    setOpenEditModal(true)
                                    setSelectedDelivery(delivery)
                                }}
                            />
                        </Tooltip>
                        <Popconfirm
                            title={t('deliveries.actions.delete')}
                            description={t('deliveries.actions.deleteConfirmation')}
                            onConfirm={() => handleDelete(delivery.id)}
                            onCancel={() => {}}
                            okText={t('common.yes')}
                            cancelText={t('common.no')}
                            disabled={locked}
                        >
                            <Tooltip title={locked ? t('deliveries.status.lockedHint') : null}>
                                <Button
                                    type="primary"
                                    icon={<DeleteFilled />}
                                    danger
                                    disabled={locked}
                                />
                            </Tooltip>
                        </Popconfirm>
                    </Flex>
                )
            },
        },
    ]

    return (
        <>
            {contextHolder}
            <Flex
                vertical
                gap={16}
            >
                <Flex gap={16}>
                    <Button
                        type="primary"
                        onClick={() => setOpenAddModal(true)}
                    >
                        {t('deliveries.actions.add')}
                    </Button>
                </Flex>
                <Card styles={{ body: { padding: 0 } }}>
                    <Flex
                        wrap
                        gap={16}
                        align="center"
                        justify="space-between"
                        style={{ padding: 16 }}
                    >
                        <Flex
                            wrap
                            gap={16}
                            align="center"
                        >
                            <Segmented
                                value={filters.status}
                                onChange={setFilter('status')}
                                options={STATUS_FILTERS.map((status) => ({
                                    value: status,
                                    label:
                                        status === 'all'
                                            ? t('deliveries.filters.all')
                                            : t(`deliveries.status.${status}`),
                                }))}
                            />
                            <DatePicker.RangePicker
                                allowEmpty={[true, true]}
                                format="DD.MM.YYYY"
                                value={[
                                    filters.dateFrom ? dayjs(filters.dateFrom) : null,
                                    filters.dateTo ? dayjs(filters.dateTo) : null,
                                ]}
                                onChange={setDateRange}
                            />
                            <CustomerSelect
                                supabase={supabase}
                                enabled
                                includeArchived
                                style={{ width: 260 }}
                                placeholder={t('deliveries.table.columns.customer')}
                                value={filters.customer}
                                onChange={setFilter('customer')}
                            />
                        </Flex>
                        <Space>
                            <Text type="secondary">{t('deliveries.filters.count', { count: data?.total || 0 })}</Text>
                            {filtersActive(filters) && (
                                <Button
                                    icon={<ClearOutlined />}
                                    onClick={resetFilters}
                                >
                                    {t('deliveries.filters.reset')}
                                </Button>
                            )}
                        </Space>
                    </Flex>
                    <Table
                        size="small"
                        loading={isLoading}
                        columns={columns}
                        dataSource={data?.data || []}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: data?.total || 0,
                            showSizeChanger: true,
                            style: { margin: 0, padding: 16 },
                            onChange: (current, pageSize) => setPagination({ current, pageSize }),
                        }}
                        rowKey="id"
                        scroll={{ x: 'max-content' }}
                    />
                </Card>
            </Flex>
            <AddDeliveryModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
            />
            <EditDeliveryModal
                open={openEditModal}
                onClose={() => {
                    setOpenEditModal(false)
                    setSelectedDelivery(null)
                }}
                delivery={selectedDelivery}
            />
        </>
    )
}
export default DeliveriesTable
