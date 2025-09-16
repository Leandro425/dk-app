import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Flex, Table } from 'antd'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useState } from 'react'
import AddReportModal from '../modals/AddReportModal'
import EditReportModal from '../modals/EditReportModal'
import {
    formatDate,
    formatDateTime,
    getEmployeeLabel,
    getFieldLabel,
    getSupervisorLabel,
} from '../../../../utils/helpers'

const ReportsTable = () => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
    const [openAddModal, setOpenAddModal] = useState(false)
    const [selectedReport, setSelectedReport] = useState(null)
    const [openEditModal, setOpenEditModal] = useState(false)

    const fetchData = async ({ queryKey }) => {
        const [, page, pageSize] = queryKey
        const from = (page - 1) * pageSize
        const to = page * pageSize - 1
        const { data, count, error } = await supabase
            .from('Report')
            .select(
                '*, employee:Employee(*), field:Field(*), article:Article(*), created_by:Supervisor!Report_created_by_fkey(*), modified_by:Supervisor!Report_modified_by_fkey(*)',
                {
                    count: 'exact',
                }
            )
            .range(from, to)
            .order('id', { ascending: false })
        if (error) {
            return { data: [], total: 0 }
        }
        return { data, total: count }
    }

    const { data, isLoading } = useQuery({
        queryKey: ['reports', pagination.current, pagination.pageSize],
        queryFn: fetchData,
        keepPreviousData: true,
    })

    const columns = [
        { title: t('reports.table.columns.date'), dataIndex: 'date', key: 'date', render: formatDate },
        {
            title: t('reports.table.columns.employee'),
            dataIndex: 'employee',
            key: 'employee',
            render: getEmployeeLabel,
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
            render: (article) => (article ? `${article.external_id} | ${article.name}` : ''),
        },
        { title: t('reports.table.columns.quantity'), dataIndex: 'quantity', key: 'quantity', align: 'right' },
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
        },
        {
            title: t('reports.table.columns.actions'),
            key: 'operation',
            fixed: 'right',
            render: (_, report) => (
                <Button
                    type="default"
                    onClick={() => {
                        setOpenEditModal(true)
                        setSelectedReport(report)
                    }}
                >
                    {t('common.actions.edit')}
                </Button>
            ),
        },
    ]

    return (
        <>
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
                        disabled
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
