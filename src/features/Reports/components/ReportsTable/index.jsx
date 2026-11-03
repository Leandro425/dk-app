import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Card, DatePicker, Flex, Popconfirm, Space, Table, Typography, message } from 'antd'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import AddReportModal from '../modals/AddReportModal'
import EditReportModal from '../modals/EditReportModal'
import { ClearOutlined, DeleteFilled, EditFilled } from '@ant-design/icons'
import {
    formatDate,
    formatDateTime,
    getArticleLabel,
    getEmployeeLabel,
    getBatchLabel,
    getOrderLabel,
    getSupervisorLabel,
} from '../../../../utils/helpers'
import AddGroupReportModal from '../modals/AddGroupReportModal'
import useLocalStorage from '../../../../hooks/useLocalStorage'
import EmployeeSelect from '../../../../components/selects/EmployeeSelect'
import OrderSelect from '../../../../components/selects/OrderSelect'
import BatchSelect from '../../../../components/selects/BatchSelect'
import ArticleSelect from '../../../../components/selects/ArticleSelect'

const { Text } = Typography

const DATE_FORMAT = 'YYYY-MM-DD'
const DEFAULT_FILTERS = { dateFrom: null, dateTo: null, employee: null, order: null, batch: null, article: null }
const FILTERS_STORAGE_KEY = 'reports.filters'
const FILTER_SELECT_STYLE = { width: 220 }

// Stored filters may come from an older version of the page: fill gaps and drop unknown keys.
const sanitizeFilters = (stored) =>
    Object.fromEntries(Object.keys(DEFAULT_FILTERS).map((key) => [key, stored?.[key] ?? DEFAULT_FILTERS[key]]))

const filtersActive = (filters) => Object.values(filters).some((value) => value !== null)

const ReportsTable = () => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const [messageApi, contextHolder] = message.useMessage()
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
    const [openAddModal, setOpenAddModal] = useState(false)
    const [openAddGroupModal, setOpenAddGroupModal] = useState(false)
    const [selectedReport, setSelectedReport] = useState(null)
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
            .from('report')
            .select(
                '*, employee:employee(id, staff_number, firstname, lastname), order:order(*), batch:batch(*), article:article(*), created_by:supervisor!report_created_by_id_fkey(*), modified_by:supervisor!report_modified_by_id_fkey(*)',
                {
                    count: 'exact',
                }
            )
        if (filters.dateFrom) query = query.gte('date', filters.dateFrom)
        if (filters.dateTo) query = query.lte('date', filters.dateTo)
        if (filters.employee) query = query.eq('employee_id', filters.employee)
        if (filters.order) query = query.eq('order_id', filters.order)
        if (filters.batch) query = query.eq('batch_id', filters.batch)
        if (filters.article) query = query.eq('article_id', filters.article)
        const { data, count, error } = await query.range(from, to).order(sorterColumn, sorterOptions)
        if (error) {
            return { data: [], total: 0 }
        }
        return { data, total: count }
    }

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['reports', pagination.current, pagination.pageSize, sorter.column, sorter.options, filters],
        queryFn: fetchData,
        keepPreviousData: true,
    })

    const handleDelete = async (reportId) => {
        const { error } = await supabase.from('report').delete().eq('id', reportId)

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
            title: t('reports.table.columns.employee'),
            dataIndex: 'employee',
            key: 'employee',
            render: getEmployeeLabel,
            sorter: false,
        },
        {
            title: t('reports.table.columns.order'),
            dataIndex: 'order',
            key: 'order',
            render: getOrderLabel,
        },
        {
            title: t('reports.table.columns.field'),
            dataIndex: 'batch',
            key: 'batch',
            render: getBatchLabel,
        },
        {
            title: t('reports.table.columns.article'),
            dataIndex: 'article',
            key: 'article',
            render: getArticleLabel,
        },
        {
            title: t('reports.table.columns.quantity'),
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right',
            sorter: true,
        },
        {
            title: t('reports.table.columns.specialFeature'),
            dataIndex: 'special_feature',
            key: 'special_feature',
            render: (value) => (value ? t(`reports.report.specialFeatures.${value}`) : ''),
        },
        { title: t('reports.table.columns.annotation'), dataIndex: 'annotation', key: 'annotation' },
        {
            title: t('reports.table.columns.notChargingPieceworkWage'),
            dataIndex: 'not_charging_piecework_wage',
            key: 'not_charging_piecework_wage',
            render: (value) => (value ? t('common.yes') : t('common.no')),
        },
        {
            title: t('reports.table.columns.modifiedBy'),
            dataIndex: 'modified_by',
            key: 'modified_by',
            render: getSupervisorLabel,
        },
        {
            title: t('reports.table.columns.modifiedAt'),
            dataIndex: 'modified_at',
            key: 'modified_at',
            render: formatDateTime,
            sorter: true,
        },
        {
            title: t('reports.table.columns.createdBy'),
            dataIndex: 'created_by',
            key: 'created_by',
            render: getSupervisorLabel,
        },
        {
            title: t('reports.table.columns.createdAt'),
            dataIndex: 'created_at',
            key: 'created_at',
            render: formatDateTime,
            sorter: true,
        },
        {
            title: t('reports.table.columns.actions'),
            key: 'operation',
            fixed: 'right',
            width: 100,
            render: (_, report) => (
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
                            setSelectedReport(report)
                        }}
                    />
                    <Popconfirm
                        title={t('reports.actions.delete')}
                        description={t('reports.actions.deleteConfirmation')}
                        onConfirm={() => handleDelete(report.id)}
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
                        {t('reports.actions.add')}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => setOpenAddGroupModal(true)}
                    >
                        {t('reports.actions.addGroup')}
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
                                placeholder={t('reports.table.columns.employee')}
                                value={filters.employee}
                                onChange={setFilter('employee')}
                            />
                            <OrderSelect
                                supabase={supabase}
                                enabled
                                style={FILTER_SELECT_STYLE}
                                placeholder={t('reports.table.columns.order')}
                                value={filters.order}
                                onChange={setFilter('order')}
                            />
                            <BatchSelect
                                supabase={supabase}
                                enabled
                                style={FILTER_SELECT_STYLE}
                                type="field"
                                includeArchived
                                placeholder={t('reports.table.columns.field')}
                                value={filters.batch}
                                onChange={setFilter('batch')}
                            />
                            <ArticleSelect
                                supabase={supabase}
                                enabled
                                style={FILTER_SELECT_STYLE}
                                includeArchived
                                placeholder={t('reports.table.columns.article')}
                                value={filters.article}
                                onChange={setFilter('article')}
                            />
                        </Flex>
                        <Space>
                            <Text type="secondary">{t('reports.filters.count', { count: data?.total || 0 })}</Text>
                            {filtersActive(filters) && (
                                <Button
                                    icon={<ClearOutlined />}
                                    onClick={resetFilters}
                                >
                                    {t('reports.filters.reset')}
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
            <AddReportModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
            />
            <AddGroupReportModal
                open={openAddGroupModal}
                onClose={() => setOpenAddGroupModal(false)}
            />
            <EditReportModal
                open={openEditModal}
                onClose={() => {
                    setOpenEditModal(false)
                    setSelectedReport(null)
                }}
                report={selectedReport}
            />
        </>
    )
}
export default ReportsTable
