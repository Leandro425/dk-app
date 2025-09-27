import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Flex, Table, message } from 'antd'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useState } from 'react'
import AddTimestampModal from '../modals/AddTimestampModal'
import EditTimestampModal from '../modals/EditTimestampModal'
import { formatDate, formatDateTime, formatTime, getEmployeeLabel, getSupervisorLabel } from '../../../../utils/helpers'
import { DeleteFilled, EditFilled } from '@ant-design/icons'
import AddGroupTimestampModal from '../modals/AddGroupTimestampModal'

const TimestampsTable = () => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const [messageApi, contextHolder] = message.useMessage()
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
    const [openAddModal, setOpenAddModal] = useState(false)
    const [openAddGroupModal, setOpenAddGroupModal] = useState(false)
    const [selectedTimestamp, setSelectedTimestamp] = useState(null)
    const [openEditModal, setOpenEditModal] = useState(false)

    const fetchData = async ({ queryKey }) => {
        const [, page, pageSize] = queryKey
        const from = (page - 1) * pageSize
        const to = page * pageSize - 1
        const { data, count, error } = await supabase
            .from('timestamp')
            .select(
                '*, employee:employee(*), created_by:supervisor!timestamp_created_by_id_fkey(*), modified_by:supervisor!timestamp_modified_by_id_fkey(*)',
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

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['timestamps', pagination.current, pagination.pageSize],
        queryFn: fetchData,
        keepPreviousData: true,
    })

    const handleDelete = async (timestampId) => {
        const { error } = await supabase.from('timestamp').delete().eq('id', timestampId)

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
        { title: t('reports.table.columns.date'), dataIndex: 'date', key: 'date', render: formatDate },
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
        },
        {
            title: t('timestamps.table.columns.endTime'),
            dataIndex: 'end_time',
            key: 'end_time',
            render: formatTime,
            align: 'right',
        },
        {
            title: t('timestamps.table.columns.breaktime'),
            dataIndex: 'break_in_min',
            key: 'break_in_min',
            align: 'right',
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
                    <Button
                        type="primary"
                        icon={<DeleteFilled />}
                        onClick={() => {
                            handleDelete(timestamp.id)
                        }}
                        danger
                    />
                </Flex>
            ),
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
                        {t('timestamps.actions.add')}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => setOpenAddGroupModal(true)}
                    >
                        {t('timestamps.actions.addGroup')}
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
