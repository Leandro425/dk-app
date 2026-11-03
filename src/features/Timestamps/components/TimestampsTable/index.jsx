import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Card, DatePicker, Flex, Popconfirm, Select, Space, Table, Typography, message } from 'antd'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import AddTimestampModal from '../modals/AddTimestampModal'
import EditTimestampModal from '../modals/EditTimestampModal'
import { formatDate, formatDateTime, formatTime, getEmployeeLabel, getSupervisorLabel } from '../../../../utils/helpers'
import { ClearOutlined, DeleteFilled, EditFilled } from '@ant-design/icons'
import AddGroupTimestampModal from '../modals/AddGroupTimestampModal'
import useLocalStorage from '../../../../hooks/useLocalStorage'
import EmployeeSelect from '../../../../components/selects/EmployeeSelect'

const { Text } = Typography

const DATE_FORMAT = 'YYYY-MM-DD'
const TIMESTAMP_TYPES = ['workingTime', 'vacation', 'sickness']
const DEFAULT_FILTERS = { dateFrom: null, dateTo: null, employee: null, type: null }
const FILTERS_STORAGE_KEY = 'timestamps.filters'
const FILTER_SELECT_STYLE = { width: 220 }

// Stored filters may come from an older version of the page: fill gaps and drop unknown keys.
const sanitizeFilters = (stored) => {
    const filters = Object.fromEntries(
        Object.keys(DEFAULT_FILTERS).map((key) => [key, stored?.[key] ?? DEFAULT_FILTERS[key]])
    )
    return TIMESTAMP_TYPES.includes(filters.type) ? filters : { ...filters, type: null }
}

const filtersActive = (filters) => Object.values(filters).some((value) => value !== null)

const TimestampsTable = () => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const [messageApi, contextHolder] = message.useMessage()
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
    const [openAddModal, setOpenAddModal] = useState(false)
    const [openAddGroupModal, setOpenAddGroupModal] = useState(false)
    const [selectedTimestamp, setSelectedTimestamp] = useState(null)
    const [openEditModal, setOpenEditModal] = useState(false)
    const [storedFilters, setFilters] = useLocalStorage(FILTERS_STORAGE_KEY, DEFAULT_FILTERS)
    const filters = useMemo(() => sanitizeFilters(storedFilters), [storedFilters])

    const resetPage = () => setPagination((current) => ({ ...current, current: 1 }))
    const setFilter = (key) => (value) => {
        setFilters((current) => ({ ...sanitizeFilters(current), [key]: value ?? null }))
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

    const [sorter, setSorter] = useState({
        column: 'id',
        options: {
            ascending: false,
        },
    })

    const fetchData = async ({ queryKey }) => {
        const [, page, pageSize, sorterColumn, sorterOptions, filters] = queryKey
        const from = (page - 1) * pageSize
        const to = page * pageSize - 1
        let query = supabase
            .from('timestamp')
            .select(
                '*, employee:employee(id, staff_number, firstname, lastname), created_by:supervisor!timestamp_created_by_id_fkey(*), modified_by:supervisor!timestamp_modified_by_id_fkey(*)',
                {
                    count: 'exact',
                }
            )
        if (filters.dateFrom) query = query.gte('date', filters.dateFrom)
        if (filters.dateTo) query = query.lte('date', filters.dateTo)
        if (filters.employee) query = query.eq('employee_id', filters.employee)
        if (filters.type) query = query.eq('type', filters.type)
        const { data, count, error } = await query.range(from, to).order(sorterColumn, sorterOptions)
        if (error) {
            return { data: [], total: 0 }
        }
        return { data, total: count }
    }

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['timestamps', pagination.current, pagination.pageSize, sorter.column, sorter.options, filters],
        queryFn: fetchData,
        keepPreviousData: true,
    })

    const handleDelete = async (timestampId) => {
        const { error } = await supabase.from('timestamp').delete().eq('id', timestampId)

        messageApi.open({
            type: error ? 'error' : 'success',
            content: error ? t('common.messages.errorOccurred') : t('common.messages.successfullyDeleted'),
            duration: 3,
        })

        if (!error) {
            refetch()
        }
    }

    const columns = [
        { title: t('reports.table.columns.date'), dataIndex: 'date', key: 'date', render: formatDate, sorter: true },
        {
            title: t('timestamps.table.columns.employee'),
            dataIndex: 'employee',
            key: 'employee',
            render: getEmployeeLabel,
        },
        {
            title: t('timestamps.table.columns.startTime'),
            dataIndex: 'start_time',
            key: 'start_time',
            render: formatTime,
            align: 'right',
            sorter: true,
        },
        {
            title: t('timestamps.table.columns.endTime'),
            dataIndex: 'end_time',
            key: 'end_time',
            render: formatTime,
            align: 'right',
            sorter: true,
        },
        {
            title: t('timestamps.table.columns.breaktime'),
            dataIndex: 'break_in_min',
            key: 'break_in_min',
            align: 'right',
        },
        {
            title: t('timestamps.table.columns.type'),
            dataIndex: 'type',
            key: 'type',
            render: (value) => (value ? t(`timestamps.timestamp.types.${value}`) : ''),
        },
        { title: t('timestamps.table.columns.annotation'), dataIndex: 'annotation', key: 'annotation' },
        {
            title: t('timestamps.table.columns.modifiedBy'),
            dataIndex: 'modified_by',
            key: 'modified_by',
            render: getSupervisorLabel,
        },
        {
            title: t('timestamps.table.columns.modifiedAt'),
            dataIndex: 'modified_at',
            key: 'modified_at',
            render: formatDateTime,
            sorter: true,
        },
        {
            title: t('timestamps.table.columns.createdBy'),
            dataIndex: 'created_by',
            key: 'created_by',
            render: getSupervisorLabel,
        },
        {
            title: t('timestamps.table.columns.createdAt'),
            dataIndex: 'created_at',
            key: 'created_at',
            render: formatDateTime,
            sorter: true,
        },
        {
            title: t('timestamps.table.columns.actions'),
            key: 'operation',
            fixed: 'right',
            width: 100,
            render: (_, timestamp) => (
                <Flex
                    gap={8}
                    flex={1}
                    justify="center"
                    align="center"
                >
                    <Button
                        type="primary"
                        icon={<EditFilled />}
                        onClick={() => {
                            setOpenEditModal(true)
                            setSelectedTimestamp(timestamp)
                        }}
                    />
                    <Popconfirm
                        title={t('timestamps.actions.delete')}
                        description={t('timestamps.actions.deleteConfirmation')}
                        onConfirm={() => handleDelete(timestamp.id)}
                        onCancel={() => {}}
                        okText={t('common.yes')}
                        cancelText={t('common.no')}
                    >
                        <Button
                            type="primary"
                            icon={<DeleteFilled />}
                            danger
                        />
                    </Popconfirm>
                </Flex>
            ),
        },
    ]

    const foreignKeyColumns = {
        employee: {
            referencedTable: 'employee',
            field: 'lastname',
        },
    }

    const handleChange = (_, __, sorter) => {
        if (sorter.columnKey && sorter.order) {
            const column = sorter.columnKey
            const ascending = sorter.order === 'ascend'
            if (foreignKeyColumns[column]) {
                // setSorter({
                //     column: foreignKeyColumns[column].field,
                //     options: { referencedTable: foreignKeyColumns[column].referencedTable, ascending: ascending },
                // })
            } else {
                setSorter({ column: sorter.columnKey, options: { ascending: ascending } })
            }
        } else {
            setSorter({ column: 'id', options: { ascending: true } })
        }
    }

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
                        {t('timestamps.actions.add')}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => setOpenAddGroupModal(true)}
                    >
                        {t('timestamps.actions.addGroup')}
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
                            <DatePicker.RangePicker
                                allowEmpty={[true, true]}
                                format="DD.MM.YYYY"
                                value={[
                                    filters.dateFrom ? dayjs(filters.dateFrom) : null,
                                    filters.dateTo ? dayjs(filters.dateTo) : null,
                                ]}
                                onChange={setDateRange}
                            />
                            <EmployeeSelect
                                supabase={supabase}
                                enabled
                                style={FILTER_SELECT_STYLE}
                                placeholder={t('timestamps.table.columns.employee')}
                                value={filters.employee}
                                onChange={setFilter('employee')}
                            />
                            <Select
                                allowClear
                                style={FILTER_SELECT_STYLE}
                                placeholder={t('timestamps.table.columns.type')}
                                value={filters.type}
                                onChange={setFilter('type')}
                                options={TIMESTAMP_TYPES.map((type) => ({
                                    value: type,
                                    label: t(`timestamps.timestamp.types.${type}`),
                                }))}
                            />
                        </Flex>
                        <Space>
                            <Text type="secondary">{t('timestamps.filters.count', { count: data?.total || 0 })}</Text>
                            {filtersActive(filters) && (
                                <Button
                                    icon={<ClearOutlined />}
                                    onClick={resetFilters}
                                >
                                    {t('timestamps.filters.reset')}
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
                        onChange={handleChange}
                        rowKey="id"
                        scroll={{ x: 'max-content' }}
                    />
                </Card>
            </Flex>
            <AddTimestampModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
            />
            <AddGroupTimestampModal
                open={openAddGroupModal}
                onClose={() => setOpenAddGroupModal(false)}
            />
            <EditTimestampModal
                open={openEditModal}
                onClose={() => {
                    setOpenEditModal(false)
                    setSelectedTimestamp(null)
                }}
                timestamp={selectedTimestamp}
            />
        </>
    )
}
export default TimestampsTable
