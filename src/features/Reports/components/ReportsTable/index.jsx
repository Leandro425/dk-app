import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Flex, Popconfirm, Table, message } from 'antd'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useState } from 'react'
import AddReportModal from '../modals/AddReportModal'
import EditReportModal from '../modals/EditReportModal'
import { DeleteFilled, EditFilled } from '@ant-design/icons'
import {
    formatDate,
    formatDateTime,
    getArticleLabel,
    getEmployeeLabel,
    getFieldLabel,
    getOrderLabel,
    getSupervisorLabel,
} from '../../../../utils/helpers'
import AddGroupReportModal from '../modals/AddGroupReportModal'

const ReportsTable = () => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const [messageApi, contextHolder] = message.useMessage()
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
    const [openAddModal, setOpenAddModal] = useState(false)
    const [openAddGroupModal, setOpenAddGroupModal] = useState(false)
    const [selectedReport, setSelectedReport] = useState(null)
    const [openEditModal, setOpenEditModal] = useState(false)
    const [sorter, setSorter] = useState({
        column: 'id',
        options: {
            ascending: false,
        },
    })

    const fetchData = async ({ queryKey }) => {
        const [, page, pageSize, sorterColumn, sorterOptions] = queryKey
        const from = (page - 1) * pageSize
        const to = page * pageSize - 1
        const { data, count, error } = await supabase
            .from('report')
            .select(
                '*, employee:employee(lastname, *), order:order(*), field:field(*), article:article(*), created_by:supervisor!report_created_by_id_fkey(*), modified_by:supervisor!report_modified_by_id_fkey(*)',
                {
                    count: 'exact',
                }
            )
            .range(from, to)
            .order(sorterColumn, sorterOptions)
        if (error) {
            return { data: [], total: 0 }
        }
        return { data, total: count }
    }

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['reports', pagination.current, pagination.pageSize, sorter.column, sorter.options],
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
            dataIndex: 'field',
            key: 'field',
            render: getFieldLabel,
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
                <Flex
                    style={{
                        padding: 0,
                        borderRadius: 8,
                        overflow: 'hidden',
                    }}
                >
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
                            onChange: (current, pageSize) => setPagination({ current, pageSize }),
                        }}
                        onChange={handleChange}
                        rowKey="id"
                        scroll={{ x: 'max-content' }}
                        style={{ width: '100%' }}
                    />
                </Flex>
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
