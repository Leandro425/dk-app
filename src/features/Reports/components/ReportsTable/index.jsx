import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Flex, Table } from 'antd'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useState } from 'react'
import AddReportModal from '../modals/AddReportModal'
import EditReportModal from '../modals/EditReportModal'

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
            .from('Note')
            .select('*', { count: 'exact' })
            .range(from, to)
            .order('id', { ascending: false })
        if (error) {
            // console.error('Error fetching data:', error)
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
        { title: t('reports.table.columns.id'), dataIndex: 'id', key: 'id' },
        { title: t('reports.table.columns.text'), dataIndex: 'text', key: 'text' },
        { title: t('reports.table.columns.createdAt'), dataIndex: 'created_at', key: 'created_at' },
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
                <Flex
                    horizontal
                    gap={16}
                >
                    <Button
                        type="primary"
                        onClick={() => setOpenAddModal(true)}
                    >
                        {t('reports.actions.add')}
                    </Button>
                    <Button
                        type="primary"
                        // disabled
                    >
                        {t('reports.actions.addMany')}
                    </Button>
                </Flex>
                <Table
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
                />
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
